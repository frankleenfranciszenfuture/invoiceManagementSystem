package com.ims.service.impl.inventory;


import com.ims.dtos.inventory.*;

import com.ims.entity.*;

import com.ims.enums.InventoryMovementType;
import com.ims.enums.InventoryReferenceType;

import com.ims.exception.BadRequestException;
import com.ims.mapper.inventory.InventoryStockMapper;
import com.ims.mapper.inventory.InventoryTransactionMapper;

import com.ims.repository.InventoryStockRepository;
import com.ims.repository.InventoryTransactionRepository;

import com.ims.service.serviceInterface.inventory.InventoryService;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.specification.InventoryStockSpecification;
import com.ims.utils.specification.InventoryTransactionSpecification;
import com.ims.utils.validation.InventoryValidation;

import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class InventoryServiceImpl implements InventoryService {

    private final InventoryStockRepository stockRepository;
    private final InventoryTransactionRepository transactionRepository;

    private final InventoryStockMapper stockMapper;
    private final InventoryTransactionMapper transactionMapper;

    private final InventoryValidation inventoryValidation;
    private final BaseEntityUtil baseEntityUtil;

    private static final int SCALE = 4;

    // =========================================================
    // OPENING STOCK
    // =========================================================

    @Override
    @Transactional
    public InventoryStockResponse createOpeningStock(
            InventoryOpeningStockRequest request) {

        validatePositiveQuantity(request.getQuantity(), "Opening quantity");

        if (request.getUnitCost() == null
                || request.getUnitCost().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Opening stock unit cost must be zero or greater."
            );
        }

        var product = inventoryValidation.validateProduct(request.getProductId());
        var warehouse = inventoryValidation.validateWarehouse(request.getWarehouseId());
        var unit = inventoryValidation.validateUnit(request.getUnitId());
        var size = inventoryValidation.validateSize(request.getSizeId());

        InventoryStockEntity stock = getOrCreateStock(
                product,
                warehouse,
                unit,
                size
        );

        if (stock.getQuantity() != null
                && stock.getQuantity().compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalStateException(
                    "Opening stock has already been created for this product, warehouse, unit and size."
            );
        }

        BigDecimal quantity = scale(request.getQuantity());
        BigDecimal unitCost = scale(request.getUnitCost());

        stock.setQuantity(quantity);
        stock.setReservedQuantity(BigDecimal.ZERO.setScale(SCALE));
        stock.setAvailableQuantity(quantity);
        stock.setAverageCost(unitCost);

        stock = stockRepository.save(stock);

        InventoryTransactionEntity transaction = createTransaction(
                stock,
                InventoryMovementType.OPENING_STOCK,
                InventoryReferenceType.OPENING_STOCK,
                null,
                quantity,
                BigDecimal.ZERO,
                quantity,
                unitCost,
                request.getTransactionDate(),
                request.getNotes()
        );

        transactionRepository.save(transaction);

        return stockMapper.toResponse(stock);
    }

    // =========================================================
    // STOCK ADJUSTMENT
    // =========================================================

    @Override
    @Transactional
    public InventoryStockResponse adjustStock(
            InventoryAdjustmentRequest request) {

        validatePositiveQuantity(request.getQuantity(), "Adjustment quantity");

        InventoryMovementType movementType = request.getMovementType();

        if (movementType != InventoryMovementType.STOCK_ADJUSTMENT_IN
                && movementType != InventoryMovementType.STOCK_ADJUSTMENT_OUT) {
            throw new IllegalArgumentException(
                    "Only STOCK_ADJUSTMENT_IN and STOCK_ADJUSTMENT_OUT are allowed."
            );
        }

        var product = inventoryValidation.validateProduct(request.getProductId());
        var warehouse = inventoryValidation.validateWarehouse(request.getWarehouseId());
        var unit = inventoryValidation.validateUnit(request.getUnitId());
        var size = inventoryValidation.validateSize(request.getSizeId());

        InventoryStockEntity stock = getOrCreateStock(
                product,
                warehouse,
                unit,
                size
        );

        BigDecimal oldQuantity = valueOrZero(stock.getQuantity());
        BigDecimal oldReserved = valueOrZero(stock.getReservedQuantity());
        BigDecimal oldAverageCost = valueOrZero(stock.getAverageCost());
        BigDecimal adjustmentQuantity = scale(request.getQuantity());

        BigDecimal quantityIn = BigDecimal.ZERO.setScale(SCALE);
        BigDecimal quantityOut = BigDecimal.ZERO.setScale(SCALE);
        BigDecimal transactionCost;

        if (movementType == InventoryMovementType.STOCK_ADJUSTMENT_IN) {

            quantityIn = adjustmentQuantity;

            transactionCost = request.getUnitCost() != null
                    ? scale(request.getUnitCost())
                    : oldAverageCost;

            if (transactionCost.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException(
                        "Adjustment unit cost cannot be negative."
                );
            }

            BigDecimal newQuantity = oldQuantity.add(adjustmentQuantity);

            BigDecimal newAverageCost = calculateWeightedAverageCost(
                    oldQuantity,
                    oldAverageCost,
                    adjustmentQuantity,
                    transactionCost
            );

            stock.setQuantity(newQuantity);
            stock.setAverageCost(newAverageCost);

        } else {

            quantityOut = adjustmentQuantity;

            BigDecimal availableQuantity = oldQuantity.subtract(oldReserved);

            if (adjustmentQuantity.compareTo(availableQuantity) > 0) {
                throw new IllegalStateException(
                        "Insufficient available stock. Available quantity: "
                                + availableQuantity
                );
            }

            transactionCost = oldAverageCost;

            BigDecimal newQuantity = oldQuantity.subtract(adjustmentQuantity);

            stock.setQuantity(newQuantity);
        }

        BigDecimal newAvailableQuantity = stock.getQuantity().subtract(oldReserved);

        if (newAvailableQuantity.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException(
                    "Stock adjustment cannot reduce available quantity below zero."
            );
        }

        stock.setReservedQuantity(oldReserved);
        stock.setAvailableQuantity(newAvailableQuantity);

        stock = stockRepository.save(stock);

        InventoryTransactionEntity transaction = createTransaction(
                stock,
                movementType,
                InventoryReferenceType.STOCK_ADJUSTMENT,
                null,
                quantityIn,
                quantityOut,
                stock.getQuantity(),
                transactionCost,
                request.getTransactionDate(),
                request.getNotes()
        );

        transactionRepository.save(transaction);

        return stockMapper.toResponse(stock);
    }

    // =========================================================
    // GET STOCK BY ID
    // =========================================================

    @Override
    public InventoryStockResponse getStockById(Long stockId) {

        InventoryStockEntity stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Inventory stock not found with ID: " + stockId
                ));

        return stockMapper.toResponse(stock);
    }

    // =========================================================
    // GET ALL STOCKS WITH FILTERS
    // =========================================================

    @Override
    public Page<InventoryStockResponse> getAllStocks(
            Long productId,
            Long warehouseId,
            Long unitId,
            Long sizeId,
            Boolean availableOnly,
            Pageable pageable) {

        Specification<InventoryStockEntity> specification =
                Specification.where(InventoryStockSpecification.hasProductId(productId))
                        .and(InventoryStockSpecification.hasWarehouseId(warehouseId))
                        .and(InventoryStockSpecification.hasUnitId(unitId))
                        .and(InventoryStockSpecification.hasSizeId(sizeId))
                        .and(InventoryStockSpecification.availableOnly(availableOnly));

        return stockRepository.findAll(specification, pageable)
                .map(stockMapper::toResponse);
    }

    // =========================================================
    // GET STOCK BY PRODUCT
    // =========================================================

    @Override
    public Page<InventoryStockResponse> getStockByProduct(
            Long productId,
            Pageable pageable) {

        inventoryValidation.validateProduct(productId);

        return stockRepository.findByProduct_Id(productId, pageable)
                .map(stockMapper::toResponse);
    }

    // =========================================================
    // GET STOCK BY WAREHOUSE
    // =========================================================

    @Override
    public Page<InventoryStockResponse> getStockByWarehouse(
            Long warehouseId,
            Pageable pageable) {

        inventoryValidation.validateWarehouse(warehouseId);

        return stockRepository.findByWarehouse_Id(warehouseId, pageable)
                .map(stockMapper::toResponse);
    }

    // =========================================================
    // GET LOW STOCK
    // =========================================================

    @Override
    public Page<InventoryStockResponse> getLowStock(
            BigDecimal minimumQuantity,
            Pageable pageable) {

        if (minimumQuantity == null
                || minimumQuantity.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Minimum quantity must be zero or greater."
            );
        }

        return stockRepository.findLowStock(
                        scale(minimumQuantity),
                        pageable
                )
                .map(stockMapper::toResponse);
    }

    // =========================================================
    // GET ALL TRANSACTIONS WITH FILTERS
    // =========================================================

    @Override
    public Page<InventoryTransactionResponse> getAllTransactions(
            Long productId,
            Long warehouseId,
            Long unitId,
            Long sizeId,
            InventoryMovementType movementType,
            InventoryReferenceType referenceType,
            Long referenceId,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable) {

        validateDateRange(fromDate, toDate);

        Specification<InventoryTransactionEntity> specification =
                Specification.where(
                                InventoryTransactionSpecification.hasProductId(productId)
                        )
                        .and(InventoryTransactionSpecification.hasWarehouseId(warehouseId))
                        .and(InventoryTransactionSpecification.hasUnitId(unitId))
                        .and(InventoryTransactionSpecification.hasSizeId(sizeId))
                        .and(InventoryTransactionSpecification.hasMovementType(movementType))
                        .and(InventoryTransactionSpecification.hasReferenceType(referenceType))
                        .and(InventoryTransactionSpecification.hasReferenceId(referenceId))
                        .and(InventoryTransactionSpecification.fromDate(fromDate))
                        .and(InventoryTransactionSpecification.toDate(toDate));

        return transactionRepository.findAll(specification, pageable)
                .map(transactionMapper::toResponse);
    }

    // =========================================================
    // GET TRANSACTION BY ID
    // =========================================================

    @Override
    public InventoryTransactionResponse getTransactionById(Long transactionId) {

        InventoryTransactionEntity transaction =
                transactionRepository.findById(transactionId)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Inventory transaction not found with ID: "
                                        + transactionId
                        ));

        return transactionMapper.toResponse(transaction);
    }

    // =========================================================
    // GET TRANSACTIONS BY PRODUCT
    // =========================================================

    @Override
    public Page<InventoryTransactionResponse> getTransactionsByProduct(
            Long productId,
            Pageable pageable) {

        inventoryValidation.validateProduct(productId);

        return transactionRepository.findByProduct_Id(productId, pageable)
                .map(transactionMapper::toResponse);
    }

    // =========================================================
    // GET TRANSACTIONS BY WAREHOUSE
    // =========================================================

    @Override
    public Page<InventoryTransactionResponse> getTransactionsByWarehouse(
            Long warehouseId,
            Pageable pageable) {

        inventoryValidation.validateWarehouse(warehouseId);

        return transactionRepository.findByWarehouse_Id(warehouseId, pageable)
                .map(transactionMapper::toResponse);
    }


    // =====================================================
// VALIDATE SALES ORDER STOCK
// Does not deduct stock or create transactions.
// =====================================================

    @Override
    @Transactional
    public void validateSalesOrderStock(
            SalesOrderEntity salesOrder
    ) {

        Map<StockKey, RequiredStock> requiredStock =
                collectRequiredStock(salesOrder);

        Long warehouseId = salesOrder.getWarehouse().getId();

        // Lock and validate every required stock row.
        for (StockKey key : sortedStockKeys(requiredStock)) {

            RequiredStock required = requiredStock.get(key);

            InventoryStockEntity stock = findLockedStock(
                    key,
                    warehouseId,
                    required.productName()
            );

            BigDecimal availableQuantity =
                    getAvailableQuantity(stock);

            if (availableQuantity.compareTo(
                    required.quantity()
            ) < 0) {

                throw new BadRequestException(
                        "Insufficient inventory for product: "
                                + required.productName()
                                + ". Available: "
                                + availableQuantity
                                + ", Required: "
                                + required.quantity()
                );
            }
        }

        log.info(
                "Stock availability validated for Sales Order: {}",
                salesOrder.getOrderNo()
        );
    }


// =====================================================
// DISPATCH SALES ORDER
// Deduct stock and create SALE transactions.
// =====================================================

    @Override
    @Transactional
    public void dispatchSalesOrder(
            SalesOrderEntity salesOrder
    ) {

        Map<StockKey, RequiredStock> requiredStock =
                collectRequiredStock(salesOrder);

        Long salesOrderId = salesOrder.getId();
        Long warehouseId = salesOrder.getWarehouse().getId();

        // Prevent duplicate inventory dispatch.
        boolean alreadyDispatched =
                transactionRepository
                        .existsByReferenceTypeAndReferenceIdAndMovementType(
                                InventoryReferenceType.SALES_DISPATCH,
                                salesOrderId,
                                InventoryMovementType.SALE
                        );

        if (alreadyDispatched) {
            throw new BadRequestException(
                    "Inventory has already been dispatched for Sales Order: "
                            + salesOrder.getOrderNo()
            );
        }

        /*
         * STEP 1:
         * Lock all stock rows and validate all quantities.
         *
         * No stock is changed in this step.
         */
        List<DispatchLine> dispatchLines = new ArrayList<>();

        for (StockKey key : sortedStockKeys(requiredStock)) {

            RequiredStock required = requiredStock.get(key);

            InventoryStockEntity stock = findLockedStock(
                    key,
                    warehouseId,
                    required.productName()
            );

            BigDecimal availableQuantity =
                    getAvailableQuantity(stock);

            if (availableQuantity.compareTo(
                    required.quantity()
            ) < 0) {

                throw new BadRequestException(
                        "Insufficient inventory for product: "
                                + required.productName()
                                + ". Available: "
                                + availableQuantity
                                + ", Required: "
                                + required.quantity()
                );
            }

            dispatchLines.add(
                    new DispatchLine(
                            stock,
                            required.quantity(),
                            required.productName()
                    )
            );
        }

        /*
         * STEP 2:
         * All stock rows passed validation.
         * Now deduct stock and create transaction records.
         */
        for (DispatchLine line : dispatchLines) {

            InventoryStockEntity stock = line.stock();

            BigDecimal dispatchQuantity = line.quantity();

            BigDecimal currentQuantity =
                    valueOrZero(stock.getQuantity());

            BigDecimal reservedQuantity =
                    valueOrZero(stock.getReservedQuantity());

            BigDecimal newQuantity =
                    currentQuantity.subtract(dispatchQuantity);

            BigDecimal newAvailableQuantity =
                    newQuantity.subtract(reservedQuantity);

            if (newQuantity.signum() < 0
                    || newAvailableQuantity.signum() < 0) {

                throw new BadRequestException(
                        "Inventory cannot become negative for product: "
                                + line.productName()
                );
            }

            stock.setQuantity(scale(newQuantity));
            stock.setReservedQuantity(scale(reservedQuantity));
            stock.setAvailableQuantity(
                    scale(newAvailableQuantity)
            );

            baseEntityUtil.prepareForUpdate(stock);

            stockRepository.save(stock);

            InventoryTransactionEntity transaction =
                    createTransaction(
                            stock,
                            InventoryMovementType.SALE,
                            InventoryReferenceType.SALES_DISPATCH,
                            salesOrderId,
                            BigDecimal.ZERO,
                            dispatchQuantity,
                            newQuantity,
                            valueOrZero(stock.getAverageCost()),
                            LocalDateTime.now(),
                            "Sales Order dispatched: "
                                    + salesOrder.getOrderNo()
                    );

            // Important: persist the ledger transaction.
            transactionRepository.save(transaction);
        }

        log.info(
                "Inventory dispatched successfully for Sales Order: {}",
                salesOrder.getOrderNo()
        );
    }


    @Override
    public InventoryDashboardResponse getInventoryDashboard(
            InventoryDashboardFilter filter
    ) {

        validateDashboardDateRange(filter);

        // =========================================
        // PAGINATION
        // =========================================

        int page = filter.getPage() == null
                ? 0
                : Math.max(filter.getPage(), 0);

        int size = filter.getSize() == null
                ? 10
                : Math.max(filter.getSize(), 1);

        String sortBy = filter.getSortBy() == null
                || filter.getSortBy().isBlank()
                ? "transactionDate"
                : filter.getSortBy();

        Sort.Direction direction =
                "ASC".equalsIgnoreCase(filter.getSortDirection())
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(
                page,
                Math.min(size, 100),
                Sort.by(direction, sortBy)
        );

        // =========================================
        // STOCK FILTERS
        // Date filters are intentionally excluded.
        // =========================================

        Specification<InventoryStockEntity> stockSpec =
                Specification.where(
                                InventoryStockSpecification.hasProductId(
                                        filter.getProductId()
                                )
                        )
                        .and(
                                InventoryStockSpecification.hasWarehouseId(
                                        filter.getWarehouseId()
                                )
                        )
                        .and(
                                InventoryStockSpecification.hasUnitId(
                                        filter.getUnitId()
                                )
                        )
                        .and(
                                InventoryStockSpecification.hasSizeId(
                                        filter.getSizeId()
                                )
                        );

        List<InventoryStockEntity> stocks =
                stockRepository.findAll(stockSpec);

        // =========================================
        // STOCK SUMMARY
        // =========================================

        BigDecimal totalQuantity = BigDecimal.ZERO;
        BigDecimal availableQuantity = BigDecimal.ZERO;
        BigDecimal reservedQuantity = BigDecimal.ZERO;
        BigDecimal totalStockValue = BigDecimal.ZERO;

        long lowStockItems = 0;
        long outOfStockItems = 0;

        Set<Long> productIds = new HashSet<>();
        Set<Long> warehouseIds = new HashSet<>();

        for (InventoryStockEntity stock : stocks) {

            BigDecimal quantity = valueOrZero(stock.getQuantity());
            BigDecimal available = valueOrZero(
                    stock.getAvailableQuantity()
            );
            BigDecimal reserved = valueOrZero(
                    stock.getReservedQuantity()
            );
            BigDecimal averageCost = valueOrZero(
                    stock.getAverageCost()
            );

            totalQuantity = totalQuantity.add(quantity);
            availableQuantity = availableQuantity.add(available);
            reservedQuantity = reservedQuantity.add(reserved);

            totalStockValue = totalStockValue.add(
                    quantity.multiply(averageCost)
            );

            if (stock.getProduct() != null) {
                productIds.add(stock.getProduct().getId());
            }

            if (stock.getWarehouse() != null) {
                warehouseIds.add(stock.getWarehouse().getId());
            }

            if (available.compareTo(BigDecimal.ZERO) <= 0) {
                outOfStockItems++;
            }
        }

        // =========================================
        // TRANSACTION FILTERS
        // =========================================

        Specification<InventoryTransactionEntity> transactionSpec =
                Specification.where(
                                InventoryTransactionSpecification.hasProductId(
                                        filter.getProductId()
                                )
                        )
                        .and(
                                InventoryTransactionSpecification.hasWarehouseId(
                                        filter.getWarehouseId()
                                )
                        )
                        .and(
                                InventoryTransactionSpecification.hasUnitId(
                                        filter.getUnitId()
                                )
                        )
                        .and(
                                InventoryTransactionSpecification.hasSizeId(
                                        filter.getSizeId()
                                )
                        )
                        .and(
                                InventoryTransactionSpecification.hasMovementType(
                                        filter.getMovementType()
                                )
                        )
                        .and(
                                InventoryTransactionSpecification.hasReferenceType(
                                        filter.getReferenceType()
                                )
                        )
                        .and(
                                InventoryTransactionSpecification.fromDate(
                                        filter.getFromDate()
                                )
                        )
                        .and(
                                InventoryTransactionSpecification.toDate(
                                        filter.getToDate()
                                )
                        );

        List<InventoryTransactionEntity> transactions =
                transactionRepository.findAll(
                        transactionSpec,
                        Sort.by(
                                Sort.Direction.DESC,
                                "transactionDate"
                        )
                );

        // =========================================
        // STOCK MOVEMENT
        // =========================================

        BigDecimal totalStockIn = BigDecimal.ZERO;
        BigDecimal totalStockOut = BigDecimal.ZERO;

        long openingStock = 0;
        long adjustmentIn = 0;
        long adjustmentOut = 0;
        long sales = 0;

        Map<LocalDate, BigDecimal[]> dailyMovement =
                new TreeMap<>();

        for (InventoryTransactionEntity transaction : transactions) {

            BigDecimal quantityIn = valueOrZero(
                    transaction.getQuantityIn()
            );

            BigDecimal quantityOut = valueOrZero(
                    transaction.getQuantityOut()
            );

            totalStockIn = totalStockIn.add(quantityIn);
            totalStockOut = totalStockOut.add(quantityOut);

            if (transaction.getMovementType() != null) {

                switch (transaction.getMovementType()) {

                    case OPENING_STOCK ->
                            openingStock++;

                    case STOCK_ADJUSTMENT_IN ->
                            adjustmentIn++;

                    case STOCK_ADJUSTMENT_OUT ->
                            adjustmentOut++;

                    case SALE ->
                            sales++;

                    default -> {
                        // Other movement types are included
                        // in totalTransactions and movement totals.
                    }
                }
            }

            if (transaction.getTransactionDate() != null) {

                LocalDate date = transaction
                        .getTransactionDate()
                        .toLocalDate();

                BigDecimal[] values = dailyMovement.computeIfAbsent(
                        date,
                        key -> new BigDecimal[]{
                                BigDecimal.ZERO,
                                BigDecimal.ZERO
                        }
                );

                values[0] = values[0].add(quantityIn);
                values[1] = values[1].add(quantityOut);
            }
        }

        // =========================================
        // MOVEMENT CHART
        // =========================================

        List<InventoryDashboardResponse.MovementChart> chart =
                dailyMovement.entrySet()
                        .stream()
                        .map(entry ->
                                InventoryDashboardResponse.MovementChart
                                        .builder()
                                        .date(entry.getKey())
                                        .stockIn(entry.getValue()[0])
                                        .stockOut(entry.getValue()[1])
                                        .build()
                        )
                        .toList();

        // =========================================
        // RECENT TRANSACTIONS
        // =========================================

        Page<InventoryTransactionEntity> transactionPage =
                transactionRepository.findAll(
                        transactionSpec,
                        pageable
                );

        Page<InventoryTransactionResponse> recentTransactions =
                transactionPage.map(transactionMapper::toResponse);

        // =========================================
        // RESPONSE
        // =========================================

        return InventoryDashboardResponse.builder()

                .summary(
                        InventoryDashboardResponse.Summary.builder()
                                .totalProducts((long) productIds.size())
                                .totalWarehouses((long) warehouseIds.size())
                                .totalStockItems((long) stocks.size())
                                .totalStockQuantity(totalQuantity)
                                .totalAvailableQuantity(availableQuantity)
                                .totalReservedQuantity(reservedQuantity)
                                .lowStockItems(lowStockItems)
                                .outOfStockItems(outOfStockItems)
                                .totalStockValue(totalStockValue)
                                .build()
                )

                .stockMovement(
                        InventoryDashboardResponse.StockMovement.builder()
                                .totalStockIn(totalStockIn)
                                .totalStockOut(totalStockOut)
                                .netMovement(
                                        totalStockIn.subtract(totalStockOut)
                                )
                                .build()
                )

                .movementChart(chart)

                .transactionSummary(
                        InventoryDashboardResponse.TransactionSummary.builder()
                                .totalTransactions((long) transactions.size())
                                .openingStock(openingStock)
                                .stockAdjustmentIn(adjustmentIn)
                                .stockAdjustmentOut(adjustmentOut)
                                .sales(sales)
                                .build()
                )

                .recentTransactions(recentTransactions)

                .build();
    }

// =====================================================
// RECEIVE PURCHASE GOODS
// Add received quantities to inventory.
// Creates PURCHASE / PURCHASE_RECEIPT transactions.
// =====================================================

    @Override
    @Transactional
    public void receivePurchaseGoodsReceipt(
            PurchaseOrderGoodsReceiptEntity goodsReceipt
    ) {

        if (goodsReceipt == null || goodsReceipt.getId() == null) {
            throw new BadRequestException(
                    "Valid Goods Receipt is required."
            );
        }

        if (goodsReceipt.getPurchaseOrder() == null) {
            throw new BadRequestException(
                    "Purchase Order is required for Goods Receipt."
            );
        }

        if (goodsReceipt.getWarehouse() == null
                || goodsReceipt.getWarehouse().getId() == null) {

            throw new BadRequestException(
                    "Warehouse is required for Goods Receipt."
            );
        }

        if (goodsReceipt.getItems() == null
                || goodsReceipt.getItems().isEmpty()) {

            throw new BadRequestException(
                    "Goods Receipt must contain at least one item."
            );
        }

        Long receiptId = goodsReceipt.getId();

        Long warehouseId = goodsReceipt.getWarehouse().getId();

        /*
         * Prevent duplicate inventory processing.
         *
         * A receipt must generate inventory transactions only once.
         */
        boolean alreadyProcessed =
                transactionRepository
                        .existsByReferenceTypeAndReferenceIdAndMovementType(
                                InventoryReferenceType.PURCHASE_RECEIPT,
                                receiptId,
                                InventoryMovementType.PURCHASE
                        );

        if (alreadyProcessed) {
            throw new BadRequestException(
                    "Inventory has already been updated for Goods Receipt: "
                            + goodsReceipt.getReceiptNo()
            );
        }

        List<PurchaseOrderGoodsReceiptItemEntity> receiptItems =
                goodsReceipt.getItems()
                        .stream()
                        .filter(item ->
                                Boolean.TRUE.equals(item.getActive())
                        )
                        .toList();

        if (receiptItems.isEmpty()) {
            throw new BadRequestException(
                    "Goods Receipt must contain at least one active item."
            );
        }

        /*
         * STEP 1:
         * Validate all receipt items before changing stock.
         */
        for (PurchaseOrderGoodsReceiptItemEntity receiptItem : receiptItems) {

            if (receiptItem.getPurchaseOrderItem() == null) {
                throw new BadRequestException(
                        "Purchase Order item is required in Goods Receipt."
                );
            }

            PurchaseOrderItemEntity purchaseOrderItem =
                    receiptItem.getPurchaseOrderItem();

            if (purchaseOrderItem.getProduct() == null
                    || purchaseOrderItem.getProduct().getId() == null) {

                throw new BadRequestException(
                        "Product is required for Goods Receipt item."
                );
            }

            if (purchaseOrderItem.getUnit() == null
                    || purchaseOrderItem.getUnit().getId() == null) {

                throw new BadRequestException(
                        "Unit is required for product: "
                                + purchaseOrderItem.getProduct().getProductName()
                );
            }

            BigDecimal receivedQuantity =
                    receiptItem.getReceivedQuantity();

            if (receivedQuantity == null
                    || receivedQuantity.signum() <= 0) {

                throw new BadRequestException(
                        "Received quantity must be greater than zero."
                );
            }

            BigDecimal receivedUnitCost =
                    receiptItem.getReceivedUnitCost();

            if (receivedUnitCost == null
                    || receivedUnitCost.signum() < 0) {

                throw new BadRequestException(
                        "Received unit cost must be zero or greater."
                );
            }
        }

        /*
         * STEP 2:
         * Process each received item.
         *
         * getOrCreateStock() uses findStockForUpdate().
         * Existing stock rows are locked before updating.
         */
        for (PurchaseOrderGoodsReceiptItemEntity receiptItem : receiptItems) {

            PurchaseOrderItemEntity purchaseOrderItem =
                    receiptItem.getPurchaseOrderItem();

            ProductEntity product =
                    purchaseOrderItem.getProduct();

            UnitEntity unit =
                    purchaseOrderItem.getUnit();

            SizeEntity size =
                    purchaseOrderItem.getSize();

            BigDecimal receivedQuantity =
                    scale(receiptItem.getReceivedQuantity());

            BigDecimal receivedUnitCost =
                    scale(receiptItem.getReceivedUnitCost());

            /*
             * Get or create stock using:
             * Product + Warehouse + Unit + Size.
             */
            InventoryStockEntity stock = getOrCreateStock(
                    product,
                    goodsReceipt.getWarehouse(),
                    unit,
                    size
            );

            BigDecimal oldQuantity =
                    valueOrZero(stock.getQuantity());

            BigDecimal oldReservedQuantity =
                    valueOrZero(stock.getReservedQuantity());

            BigDecimal oldAverageCost =
                    valueOrZero(stock.getAverageCost());

            /*
             * Calculate new quantity.
             */
            BigDecimal newQuantity = scale(
                    oldQuantity.add(receivedQuantity)
            );

            /*
             * Calculate weighted average cost.
             *
             * Example:
             * Existing: 10 units x INR 100
             * Received: 5 units x INR 120
             *
             * New average = (1000 + 600) / 15
             *             = INR 106.6667
             */
            BigDecimal newAverageCost =
                    calculateWeightedAverageCost(
                            oldQuantity,
                            oldAverageCost,
                            receivedQuantity,
                            receivedUnitCost
                    );

            /*
             * Reserved quantity remains unchanged.
             */
            BigDecimal newAvailableQuantity = scale(
                    newQuantity.subtract(oldReservedQuantity)
            );

            if (newAvailableQuantity.signum() < 0) {
                throw new BadRequestException(
                        "Available stock cannot become negative for product: "
                                + product.getProductName()
                );
            }

            /*
             * Update inventory stock.
             */
            stock.setQuantity(newQuantity);

            stock.setReservedQuantity(
                    scale(oldReservedQuantity)
            );

            stock.setAvailableQuantity(newAvailableQuantity);

            stock.setAverageCost(newAverageCost);

            baseEntityUtil.prepareForUpdate(stock);

            stockRepository.save(stock);

            /*
             * Create inventory transaction.
             *
             * Quantity In  = received quantity
             * Quantity Out = zero
             * Balance After = updated stock quantity
             * Unit Cost = actual received unit cost in INR
             */
            InventoryTransactionEntity transaction =
                    createTransaction(
                            stock,
                            InventoryMovementType.PURCHASE,
                            InventoryReferenceType.PURCHASE_RECEIPT,
                            receiptId,
                            receivedQuantity,
                            BigDecimal.ZERO,
                            newQuantity,
                            receivedUnitCost,
                            goodsReceipt.getReceiptDate() != null
                                    ? goodsReceipt.getReceiptDate().atStartOfDay()
                                    : LocalDateTime.now(),
                            "Goods received against Purchase Order: "
                                    + goodsReceipt.getPurchaseOrder().getOrderNo()
                                    + ", Receipt: "
                                    + goodsReceipt.getReceiptNo()
                    );

            baseEntityUtil.prepareForCreate(transaction);

            transactionRepository.save(transaction);
        }

        log.info(
                "Inventory updated successfully for Goods Receipt: {}, Purchase Order: {}",
                goodsReceipt.getReceiptNo(),
                goodsReceipt.getPurchaseOrder().getOrderNo()
        );
    }

    private void validateDashboardDateRange(
            InventoryDashboardFilter filter
    ) {

        if (filter == null) {
            throw new BadRequestException(
                    "Dashboard filter is required."
            );
        }

        if (filter.getFromDate() != null
                && filter.getToDate() != null
                && filter.getFromDate().isAfter(filter.getToDate())) {

            throw new BadRequestException(
                    "From date cannot be after to date."
            );
        }
    }
    // =========================================================
    // GET OR CREATE STOCK
    // =========================================================

    private InventoryStockEntity getOrCreateStock(
            ProductEntity product,
            WarehouseEntity warehouse,
            UnitEntity unit,
            SizeEntity size) {

        Long sizeId = size != null ? size.getId() : null;

        Long unitId = unit != null ? unit.getId() : null;

        return stockRepository.findStockForUpdate(
                        product.getId(),
                        warehouse.getId(),
                        unitId,
                        sizeId
                )
                .orElseGet(() -> {
                    InventoryStockEntity stock = new InventoryStockEntity();

                    stock.setProduct(product);
                    stock.setWarehouse(warehouse);
                    stock.setUnit(unit);
                    stock.setSize(size);

                    stock.setQuantity(BigDecimal.ZERO.setScale(SCALE));
                    stock.setReservedQuantity(BigDecimal.ZERO.setScale(SCALE));
                    stock.setAvailableQuantity(BigDecimal.ZERO.setScale(SCALE));
                    stock.setAverageCost(BigDecimal.ZERO.setScale(SCALE));

                    return stockRepository.saveAndFlush(stock);
                });
    }

    // =========================================================
    // CREATE INVENTORY TRANSACTION
    // =========================================================

    private InventoryTransactionEntity createTransaction(
            InventoryStockEntity stock,
            InventoryMovementType movementType,
            InventoryReferenceType referenceType,
            Long referenceId,
            BigDecimal quantityIn,
            BigDecimal quantityOut,
            BigDecimal balanceAfter,
            BigDecimal unitCost,
            LocalDateTime transactionDate,
            String notes) {

        InventoryTransactionEntity transaction =
                new InventoryTransactionEntity();

        transaction.setTransactionNo(generateTransactionNo());

        transaction.setProduct(stock.getProduct());
        transaction.setWarehouse(stock.getWarehouse());
        transaction.setUnit(stock.getUnit());
        transaction.setSize(stock.getSize());

        transaction.setMovementType(movementType);
        transaction.setReferenceType(referenceType);
        transaction.setReferenceId(referenceId);

        transaction.setQuantityIn(scale(quantityIn));
        transaction.setQuantityOut(scale(quantityOut));
        transaction.setBalanceAfter(scale(balanceAfter));
        transaction.setUnitCost(scale(unitCost));

        transaction.setTransactionDate(
                transactionDate != null
                        ? transactionDate
                        : LocalDateTime.now()
        );

        transaction.setNotes(notes);

        return transaction;
    }

    // =========================================================
    // WEIGHTED AVERAGE COST
    // =========================================================

    private BigDecimal calculateWeightedAverageCost(
            BigDecimal oldQuantity,
            BigDecimal oldAverageCost,
            BigDecimal incomingQuantity,
            BigDecimal incomingUnitCost) {

        BigDecimal newQuantity = oldQuantity.add(incomingQuantity);

        if (newQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(SCALE);
        }

        BigDecimal oldValue = oldQuantity.multiply(oldAverageCost);
        BigDecimal incomingValue = incomingQuantity.multiply(incomingUnitCost);

        return oldValue.add(incomingValue)
                .divide(newQuantity, SCALE, RoundingMode.HALF_UP);
    }

    // =========================================================
    // VALIDATION HELPERS
    // =========================================================

    private void validatePositiveQuantity(
            BigDecimal quantity,
            String fieldName) {

        if (quantity == null
                || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    fieldName + " must be greater than zero."
            );
        }
    }

    private void validateDateRange(
            LocalDateTime fromDate,
            LocalDateTime toDate) {

        if (fromDate != null && toDate != null
                && fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException(
                    "From date cannot be after to date."
            );
        }
    }

    private BigDecimal valueOrZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private BigDecimal scale(BigDecimal value) {
        return valueOrZero(value)
                .setScale(SCALE, RoundingMode.HALF_UP);
    }

    private String generateTransactionNo() {
        return "STK-" + LocalDateTime.now().getYear()
                + "-" + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }

    private record StockKey(
            Long productId,
            Long unitId,
            Long sizeId
    ) {
    }

    private record RequiredStock(
            String productName,
            BigDecimal quantity
    ) {
    }

    private record DispatchLine(
            InventoryStockEntity stock,
            BigDecimal quantity,
            String productName
    ) {
    }

    private Map<StockKey, RequiredStock> collectRequiredStock(
            SalesOrderEntity salesOrder
    ) {

        if (salesOrder == null) {
            throw new BadRequestException("Valid Sales Order is required.");
        }

        if (salesOrder.getWarehouse() == null
                || salesOrder.getWarehouse().getId() == null) {
            throw new BadRequestException(
                    "Sales Order warehouse is required."
            );
        }

        if (salesOrder.getItems() == null
                || salesOrder.getItems().isEmpty()) {
            throw new BadRequestException(
                    "Sales Order must contain at least one item."
            );
        }

        Map<StockKey, RequiredStock> requiredStock =
                new LinkedHashMap<>();

        for (SalesOrderItemEntity item : salesOrder.getItems()) {

            if (item == null || item.getProduct() == null
                    || item.getProduct().getId() == null) {
                throw new BadRequestException(
                        "Product is required for every Sales Order item."
                );
            }

            String productName = item.getProduct().getProductName();

            if (item.getUnit() == null || item.getUnit().getId() == null) {
                throw new BadRequestException(
                        "Unit is required for product: " + productName
                );
            }

            BigDecimal quantity = item.getQuantity();

            if (quantity == null || quantity.signum() <= 0) {
                throw new BadRequestException(
                        "Invalid quantity for product: " + productName
                );
            }

            Long productId = item.getProduct().getId();
            Long unitId = item.getUnit().getId();

            Long sizeId = item.getSize() != null
                    ? item.getSize().getId()
                    : null;

            StockKey key = new StockKey(
                    productId,
                    unitId,
                    sizeId
            );

            BigDecimal scaledQuantity = scale(quantity);

            requiredStock.merge(
                    key,
                    new RequiredStock(productName, scaledQuantity),
                    (existing, incoming) ->
                            new RequiredStock(
                                    existing.productName(),
                                    existing.quantity().add(
                                            incoming.quantity()
                                    )
                            )
            );
        }

        return requiredStock;
    }

    private List<StockKey> sortedStockKeys(
            Map<StockKey, RequiredStock> requiredStock
    ) {

        return requiredStock.keySet()
                .stream()
                .sorted(
                        Comparator.comparing(StockKey::productId)
                                .thenComparing(
                                        StockKey::unitId,
                                        Comparator.nullsFirst(
                                                Comparator.naturalOrder()
                                        )
                                )
                                .thenComparing(
                                        StockKey::sizeId,
                                        Comparator.nullsFirst(
                                                Comparator.naturalOrder()
                                        )
                                )
                )
                .toList();
    }

    private InventoryStockEntity findLockedStock(
            StockKey key,
            Long warehouseId,
            String productName
    ) {

        return stockRepository.findStockForUpdate(
                        key.productId(),
                        warehouseId,
                        key.unitId(),
                        key.sizeId()
                )
                .orElseThrow(() ->
                        new BadRequestException(
                                "Inventory record not found. "
                                        + "Product: " + productName
                                        + ", Product ID: " + key.productId()
                                        + ", Warehouse ID: " + warehouseId
                                        + ", Unit ID: " + key.unitId()
                                        + ", Size ID: " + key.sizeId()
                        )
                );
    }

    private BigDecimal getAvailableQuantity(
            InventoryStockEntity stock
    ) {

        BigDecimal quantity = valueOrZero(stock.getQuantity());
        BigDecimal reserved = valueOrZero(
                stock.getReservedQuantity()
        );

        BigDecimal available = valueOrZero(
                stock.getAvailableQuantity()
        );

        BigDecimal calculatedAvailable = quantity.subtract(reserved);

        if (calculatedAvailable.signum() < 0) {
            throw new BadRequestException(
                    "Invalid inventory balance for stock ID: "
                            + stock.getId()
            );
        }

        if (available.compareTo(calculatedAvailable) != 0) {
            log.warn(
                    "Inventory available quantity mismatch. Stock ID: {}, "
                            + "Stored: {}, Calculated: {}",
                    stock.getId(),
                    available,
                    calculatedAvailable
            );
        }

        return calculatedAvailable;
    }
}

