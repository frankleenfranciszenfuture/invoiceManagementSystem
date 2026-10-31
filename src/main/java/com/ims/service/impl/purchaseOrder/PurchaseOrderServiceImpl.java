package com.ims.service.impl.purchaseOrder;

import com.ims.dtos.purchaseOrder.PurchaseOrderGoodsReceiptItemRequest;
import com.ims.dtos.purchaseOrder.PurchaseOrderGoodsReceiptRequest;
import com.ims.dtos.purchaseOrder.PurchaseOrderGoodsReceiptResponse;
import com.ims.dtos.purchaseOrder.PurchaseOrderItemRequest;
import com.ims.dtos.purchaseOrder.PurchaseOrderResponse;
import com.ims.dtos.purchaseOrder.PurchaseOrderRequest;
import com.ims.dtos.purchaseOrder.PurchaseOrderSearchRequest;

import com.ims.entity.Currency;
import com.ims.entity.PartyEntity;
import com.ims.entity.ProductEntity;
import com.ims.entity.PurchaseOrderEntity;
import com.ims.entity.PurchaseOrderGoodsReceiptEntity;
import com.ims.entity.PurchaseOrderGoodsReceiptItemEntity;
import com.ims.entity.PurchaseOrderItemEntity;
import com.ims.entity.SizeEntity;
import com.ims.entity.TaxMasterEntity;
import com.ims.entity.UnitEntity;
import com.ims.entity.WarehouseEntity;

import com.ims.enums.PurchaseOrderStatus;
import com.ims.enums.PurchaseOrderTaxType;

import com.ims.exception.BadRequestException;
import com.ims.exception.ResourceNotFoundException;

import com.ims.mapper.purchaseOrder.PurchaseOrderItemMapper;
import com.ims.mapper.purchaseOrder.PurchaseOrderMapper;

import com.ims.repository.CurrencyRepository;
import com.ims.repository.PurchaseOrderGoodsReceiptRepository;
import com.ims.repository.PurchaseOrderRepository;

import com.ims.service.serviceInterface.currency.ExchangeRateService;
import com.ims.service.serviceInterface.inventory.InventoryService;
import com.ims.service.serviceInterface.purchaseOrder.PurchaseOrderCalculationService;
import com.ims.service.serviceInterface.purchaseOrder.PurchaseOrderService;
import com.ims.service.serviceInterface.purchaseOrder.PurchaseOrderTaxTypeResolver;

import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.specification.PurchaseOrderSpecification;
import com.ims.utils.validation.PurchaseOrderGoodsReceiptValidation;
import com.ims.utils.validation.PurchaseOrderValidation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private static final int MONEY_SCALE = 2;
    private static final int PRICE_SCALE = 4;

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    /*
     * Replace this configuration value with your existing
     * Company Profile / Company Settings service when integrating it.
     */
    @Value("${company.registered-state}")
    private String companyRegisteredState;

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderGoodsReceiptRepository goodsReceiptRepository;

    private final CurrencyRepository currencyRepository;

    private final PurchaseOrderMapper purchaseOrderMapper;
    private final PurchaseOrderItemMapper purchaseOrderItemMapper;

    private final ExchangeRateService exchangeRateService;
    private final BaseEntityUtil baseEntityUtil;

    private final PurchaseOrderValidation purchaseOrderValidation;
    private final PurchaseOrderGoodsReceiptValidation goodsReceiptValidation;

    private final PurchaseOrderCalculationService calculationService;
    private final PurchaseOrderTaxTypeResolver purchaseOrderTaxTypeResolver;

    private final InventoryService inventoryService;


    // =====================================================
    // CREATE PURCHASE ORDER
    // =====================================================

    @Override
    public PurchaseOrderResponse createPurchaseOrder(
            PurchaseOrderRequest request
    ) {

        log.info("Creating Purchase Order");

        purchaseOrderValidation.validateRequest(request);

        OrderReferences references = resolveOrderReferences(request);

        LocalDate orderDate = request.getOrderDate() != null
                ? request.getOrderDate()
                : LocalDate.now();

        BigDecimal exchangeRate = resolveExchangeRate(
                references.currency(),
                orderDate
        );

        PurchaseOrderEntity purchaseOrder = new PurchaseOrderEntity();

        purchaseOrder.setOrderNo(generatePurchaseOrderNumber());

        purchaseOrder.setParty(references.supplier());
        purchaseOrder.setWarehouse(references.warehouse());
        purchaseOrder.setCurrency(references.currency());

        purchaseOrder.setExchangeRate(exchangeRate);

        purchaseOrder.setOrderDate(orderDate);
        purchaseOrder.setExpectedDeliveryDate(
                request.getExpectedDeliveryDate()
        );

        purchaseOrder.setNotes(request.getNotes());

        purchaseOrder.setPurchaseOrderStatus(
                PurchaseOrderStatus.DRAFT
        );

        purchaseOrder.setDiscountType(request.getDiscountType());
        purchaseOrder.setDiscountValue(
                zeroIfNull(request.getDiscountValue())
        );

        purchaseOrder.setActive(true);

        for (PurchaseOrderItemRequest itemRequest : request.getItems()) {

            PurchaseOrderItemEntity item =
                    createPurchaseOrderItem(itemRequest);

            purchaseOrder.addItem(item);

            baseEntityUtil.prepareForCreate(item);
        }

        calculatePurchaseOrder(purchaseOrder);

        // Creating a PO must not update inventory.
        baseEntityUtil.prepareForCreate(purchaseOrder);

        PurchaseOrderEntity savedPurchaseOrder =
                purchaseOrderRepository.save(purchaseOrder);

        log.info(
                "Purchase Order {} created successfully.",
                savedPurchaseOrder.getOrderNo()
        );

        return purchaseOrderMapper.toResponse(savedPurchaseOrder);
    }


    // =====================================================
    // GET PURCHASE ORDER BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPurchaseOrderById(Long id) {

        PurchaseOrderEntity purchaseOrder =
                purchaseOrderRepository.findDetailedById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Purchase Order not found with id: " + id
                                )
                        );

        return purchaseOrderMapper.toResponse(purchaseOrder);
    }


    // =====================================================
    // GET ALL PURCHASE ORDERS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponse> getAllPurchaseOrders(
            PurchaseOrderSearchRequest request,
            Pageable pageable
    ) {

        Specification<PurchaseOrderEntity> specification =
                PurchaseOrderSpecification.withFilters(request);

        Page<PurchaseOrderEntity> purchaseOrders =
                purchaseOrderRepository.findAll(
                        specification,
                        pageable
                );

        return purchaseOrders.map(purchaseOrderMapper::toResponse);
    }


    // =====================================================
    // UPDATE PURCHASE ORDER
    // =====================================================

    @Override
    public PurchaseOrderResponse updatePurchaseOrder(
            Long id,
            PurchaseOrderRequest request
    ) {

        log.info("Updating Purchase Order: {}", id);

        purchaseOrderValidation.validateRequest(request);

        PurchaseOrderEntity purchaseOrder =
                purchaseOrderRepository.findActiveByIdForUpdate(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Purchase Order not found with id: " + id
                                )
                        );

        if (purchaseOrder.getPurchaseOrderStatus()
                != PurchaseOrderStatus.DRAFT) {

            throw new BadRequestException(
                    "Only DRAFT Purchase Orders can be updated. Current status: "
                            + purchaseOrder.getPurchaseOrderStatus()
            );
        }

        OrderReferences references = resolveOrderReferences(request);

        LocalDate orderDate = request.getOrderDate() != null
                ? request.getOrderDate()
                : purchaseOrder.getOrderDate();

        validateDeliveryDate(
                orderDate,
                request.getExpectedDeliveryDate()
        );

        BigDecimal exchangeRate = resolveExchangeRate(
                references.currency(),
                orderDate
        );

        purchaseOrder.setParty(references.supplier());
        purchaseOrder.setWarehouse(references.warehouse());
        purchaseOrder.setCurrency(references.currency());

        purchaseOrder.setExchangeRate(exchangeRate);

        purchaseOrder.setOrderDate(orderDate);
        purchaseOrder.setExpectedDeliveryDate(
                request.getExpectedDeliveryDate()
        );

        purchaseOrder.setNotes(request.getNotes());

        purchaseOrder.setDiscountType(request.getDiscountType());
        purchaseOrder.setDiscountValue(
                zeroIfNull(request.getDiscountValue())
        );

        /*
         * DRAFT orders cannot have goods receipts.
         * Replace the existing items.
         */
        purchaseOrder.getItems().clear();

        for (PurchaseOrderItemRequest itemRequest : request.getItems()) {

            PurchaseOrderItemEntity item =
                    createPurchaseOrderItem(itemRequest);

            purchaseOrder.addItem(item);

            baseEntityUtil.prepareForCreate(item);
        }

        calculatePurchaseOrder(purchaseOrder);

        baseEntityUtil.prepareForUpdate(purchaseOrder);

        PurchaseOrderEntity savedPurchaseOrder =
                purchaseOrderRepository.save(purchaseOrder);

        log.info(
                "Purchase Order {} updated successfully.",
                savedPurchaseOrder.getOrderNo()
        );

        return purchaseOrderMapper.toResponse(savedPurchaseOrder);
    }


    // =====================================================
    // CONFIRM PURCHASE ORDER
    // =====================================================

    @Override
    public PurchaseOrderResponse confirmPurchaseOrder(Long id) {

        log.info("Confirming Purchase Order: {}", id);

        PurchaseOrderEntity purchaseOrder =
                purchaseOrderRepository.findActiveByIdForUpdate(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Purchase Order not found with id: " + id
                                )
                        );

        if (purchaseOrder.getPurchaseOrderStatus()
                == PurchaseOrderStatus.CANCELLED) {

            throw new BadRequestException(
                    "Cannot confirm a cancelled Purchase Order."
            );
        }

        if (purchaseOrder.getPurchaseOrderStatus()
                == PurchaseOrderStatus.CONFIRMED) {

            throw new BadRequestException(
                    "Purchase Order is already confirmed."
            );
        }

        if (purchaseOrder.getPurchaseOrderStatus()
                != PurchaseOrderStatus.DRAFT) {

            throw new BadRequestException(
                    "Only DRAFT Purchase Orders can be confirmed. Current status: "
                            + purchaseOrder.getPurchaseOrderStatus()
            );
        }

        calculatePurchaseOrder(purchaseOrder);

        /*
         * Confirmation does not update stock.
         * Stock is updated only when goods are received.
         */
        purchaseOrder.setPurchaseOrderStatus(
                PurchaseOrderStatus.CONFIRMED
        );

        baseEntityUtil.prepareForUpdate(purchaseOrder);

        PurchaseOrderEntity savedPurchaseOrder =
                purchaseOrderRepository.save(purchaseOrder);

        return purchaseOrderMapper.toResponse(savedPurchaseOrder);
    }


    // =====================================================
    // CANCEL PURCHASE ORDER
    // =====================================================

    @Override
    public PurchaseOrderResponse cancelPurchaseOrder(Long id) {

        PurchaseOrderEntity purchaseOrder =
                purchaseOrderRepository.findActiveByIdForUpdate(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Purchase Order not found with id: " + id
                                )
                        );

        if (purchaseOrder.getPurchaseOrderStatus()
                == PurchaseOrderStatus.CANCELLED) {

            throw new BadRequestException(
                    "Purchase Order is already cancelled."
            );
        }

        if (purchaseOrder.getPurchaseOrderStatus()
                == PurchaseOrderStatus.PARTIALLY_RECEIVED
                || purchaseOrder.getPurchaseOrderStatus()
                == PurchaseOrderStatus.RECEIVED) {

            throw new BadRequestException(
                    "Cannot cancel a Purchase Order after goods have been received. "
                            + "A separate purchase return or cancellation workflow is required."
            );
        }

        purchaseOrder.setPurchaseOrderStatus(
                PurchaseOrderStatus.CANCELLED
        );

        baseEntityUtil.prepareForUpdate(purchaseOrder);

        PurchaseOrderEntity savedPurchaseOrder =
                purchaseOrderRepository.save(purchaseOrder);

        return purchaseOrderMapper.toResponse(savedPurchaseOrder);
    }


    // =====================================================
    // DELETE PURCHASE ORDER
    // =====================================================

    @Override
    public void deletePurchaseOrder(Long id) {

        PurchaseOrderEntity purchaseOrder =
                purchaseOrderRepository.findActiveByIdForUpdate(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Purchase Order not found with id: " + id
                                )
                        );

        if (purchaseOrder.getPurchaseOrderStatus()
                == PurchaseOrderStatus.PARTIALLY_RECEIVED
                || purchaseOrder.getPurchaseOrderStatus()
                == PurchaseOrderStatus.RECEIVED) {

            throw new BadRequestException(
                    "Cannot delete a Purchase Order after goods have been received."
            );
        }

        if (purchaseOrder.getPurchaseOrderStatus()
                == PurchaseOrderStatus.CANCELLED) {

            throw new BadRequestException(
                    "Cancelled Purchase Orders cannot be deleted."
            );
        }

        purchaseOrder.setActive(false);

        baseEntityUtil.prepareForUpdate(purchaseOrder);

        purchaseOrderRepository.save(purchaseOrder);

        log.info("Purchase Order {} deleted successfully.", id);
    }


    // =====================================================
    // CREATE GOODS RECEIPT
    // =====================================================

    @Override
    public PurchaseOrderGoodsReceiptResponse createGoodsReceipt(
            PurchaseOrderGoodsReceiptRequest request
    ) {

        if (request == null || request.getPurchaseOrderId() == null) {
            throw new BadRequestException(
                    "Purchase Order ID is required."
            );
        }

        log.info(
                "Creating goods receipt for Purchase Order: {}",
                request.getPurchaseOrderId()
        );

        /*
         * Lock the PO to prevent concurrent receipts
         * from exceeding the pending quantity.
         */
        PurchaseOrderEntity purchaseOrder =
                purchaseOrderRepository.findActiveByIdForUpdate(
                        request.getPurchaseOrderId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Purchase Order not found with id: "
                                        + request.getPurchaseOrderId()
                        )
                );

        goodsReceiptValidation.validateReceipt(
                purchaseOrder,
                request
        );

        PurchaseOrderGoodsReceiptEntity receipt =
                new PurchaseOrderGoodsReceiptEntity();

        receipt.setReceiptNo(generateGoodsReceiptNumber());
        receipt.setWarehouse(purchaseOrder.getWarehouse());
        receipt.setReceiptDate(request.getReceiptDate());
        receipt.setNotes(request.getNotes());
        receipt.setActive(true);

        /*
         * Maintain both sides of the relationship.
         */
        purchaseOrder.addGoodsReceipt(receipt);

        BigDecimal receiptBaseTotal = ZERO;

        Set<Long> processedItemIds = new HashSet<>();

        for (PurchaseOrderGoodsReceiptItemRequest itemRequest
                : request.getItems()) {

            if (itemRequest == null
                    || itemRequest.getPurchaseOrderItemId() == null) {

                throw new BadRequestException(
                        "Purchase Order item ID is required in goods receipt."
                );
            }

            Long purchaseOrderItemId =
                    itemRequest.getPurchaseOrderItemId();

            if (!processedItemIds.add(purchaseOrderItemId)) {

                throw new BadRequestException(
                        "Duplicate Purchase Order item in goods receipt: "
                                + purchaseOrderItemId
                );
            }

            PurchaseOrderItemEntity purchaseOrderItem =
                    purchaseOrder.getItems()
                            .stream()
                            .filter(item ->
                                    item.getId() != null
                                            && item.getId().equals(purchaseOrderItemId)
                                            && Boolean.TRUE.equals(item.getActive())
                            )
                            .findFirst()
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Purchase Order item not found: "
                                                    + purchaseOrderItemId
                                    )
                            );

            BigDecimal receivedQuantity =
                    itemRequest.getReceivedQuantity();

            BigDecimal pendingQuantity =
                    purchaseOrderItem.getPendingQuantity();

            if (receivedQuantity == null
                    || receivedQuantity.signum() <= 0) {

                throw new BadRequestException(
                        "Received quantity must be greater than zero."
                );
            }

            if (receivedQuantity.compareTo(pendingQuantity) > 0) {

                throw new BadRequestException(
                        "Received quantity cannot exceed pending quantity for item: "
                                + purchaseOrderItemId
                );
            }

            /*
             * Received cost is stored in INR.
             * If the request does not contain a cost,
             * use the original base unit price.
             */
            BigDecimal receivedUnitCost =
                    itemRequest.getReceivedUnitCost() != null
                            ? itemRequest.getReceivedUnitCost()
                            : purchaseOrderItem.getBaseUnitPrice();

            if (receivedUnitCost == null
                    || receivedUnitCost.signum() < 0) {

                throw new BadRequestException(
                        "Received unit cost in INR cannot be negative or null."
                );
            }

            receivedUnitCost = receivedUnitCost.setScale(
                    PRICE_SCALE,
                    RoundingMode.HALF_UP
            );

            BigDecimal receivedTotalCost = money(
                    receivedQuantity.multiply(receivedUnitCost)
            );

            PurchaseOrderGoodsReceiptItemEntity receiptItem =
                    new PurchaseOrderGoodsReceiptItemEntity();

            receiptItem.setPurchaseOrderItem(purchaseOrderItem);
            receiptItem.setReceivedQuantity(receivedQuantity);
            receiptItem.setReceivedUnitCost(receivedUnitCost);
            receiptItem.setReceivedTotalCost(receivedTotalCost);
            receiptItem.setActive(true);

            receipt.addItem(receiptItem);

            baseEntityUtil.prepareForCreate(receiptItem);

            /*
             * Update cached cumulative quantity.
             * The goods receipt item ledger remains the source of truth.
             */
            purchaseOrderItem.setReceivedQuantity(
                    zeroIfNull(purchaseOrderItem.getReceivedQuantity())
                            .add(receivedQuantity)
            );

            baseEntityUtil.prepareForUpdate(purchaseOrderItem);

            receiptBaseTotal = receiptBaseTotal.add(receivedTotalCost);
        }

        receiptBaseTotal = money(receiptBaseTotal);

        baseEntityUtil.prepareForCreate(receipt);

        /*
         * Save receipt first so it gets an ID.
         * This is still inside the same transaction.
         */
        PurchaseOrderGoodsReceiptEntity savedReceipt =
                goodsReceiptRepository.saveAndFlush(receipt);

        /*
         * Inventory integration:
         * - Adds only received quantities.
         * - Uses receivedUnitCost in INR for weighted average cost.
         * - Creates PURCHASE / PURCHASE_RECEIPT inventory transactions.
         *
         * The inventory method must participate in this transaction.
         */
        inventoryService.receivePurchaseGoodsReceipt(savedReceipt);

        // Update received value summaries.
        BigDecimal receiptSelectedCurrencyTotal =
                receiptBaseTotal.divide(
                        purchaseOrder.getExchangeRate(),
                        MONEY_SCALE,
                        RoundingMode.HALF_UP
                );

        purchaseOrder.setBaseReceivedTotalAmount(
                money(
                        zeroIfNull(purchaseOrder.getBaseReceivedTotalAmount())
                                .add(receiptBaseTotal)
                )
        );

        purchaseOrder.setReceivedTotalAmount(
                money(
                        zeroIfNull(purchaseOrder.getReceivedTotalAmount())
                                .add(receiptSelectedCurrencyTotal)
                )
        );

        // Check whether all active PO items have been received.
        boolean allItemsReceived = purchaseOrder.getItems()
                .stream()
                .filter(item -> Boolean.TRUE.equals(item.getActive()))
                .allMatch(item ->
                        zeroIfNull(item.getReceivedQuantity())
                                .compareTo(item.getQuantity()) >= 0
                );

        purchaseOrder.setPurchaseOrderStatus(
                allItemsReceived
                        ? PurchaseOrderStatus.RECEIVED
                        : PurchaseOrderStatus.PARTIALLY_RECEIVED
        );

        baseEntityUtil.prepareForUpdate(purchaseOrder);

        purchaseOrderRepository.save(purchaseOrder);

        log.info(
                "Goods Receipt {} created for Purchase Order {}",
                savedReceipt.getReceiptNo(),
                purchaseOrder.getOrderNo()
        );

        PurchaseOrderGoodsReceiptResponse response =
                new PurchaseOrderGoodsReceiptResponse();

        response.setPurchaseOrderId(purchaseOrder.getId());
        response.setOrderNo(purchaseOrder.getOrderNo());
        response.setReceiptDate(savedReceipt.getReceiptDate());
        response.setMessage("Goods received successfully.");

        response.setItems(
                purchaseOrder.getItems()
                        .stream()
                        .filter(item -> Boolean.TRUE.equals(item.getActive()))
                        .map(purchaseOrderItemMapper::toResponse)
                        .toList()
        );

        response.setPurchaseOrder(
                purchaseOrderMapper.toResponse(purchaseOrder)
        );

        return response;
    }


    // =====================================================
    // GET GOODS RECEIPT BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderGoodsReceiptResponse getGoodsReceiptById(
            Long receiptId
    ) {

        PurchaseOrderGoodsReceiptEntity receipt =
                goodsReceiptRepository.findDetailedById(receiptId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Goods Receipt not found with id: "
                                                + receiptId
                                )
                        );

        PurchaseOrderEntity purchaseOrder = receipt.getPurchaseOrder();

        PurchaseOrderGoodsReceiptResponse response =
                new PurchaseOrderGoodsReceiptResponse();

        response.setPurchaseOrderId(purchaseOrder.getId());
        response.setOrderNo(purchaseOrder.getOrderNo());
        response.setReceiptDate(receipt.getReceiptDate());
        response.setMessage("Goods Receipt fetched successfully.");

        response.setItems(
                receipt.getItems()
                        .stream()
                        .filter(item ->
                                Boolean.TRUE.equals(item.getActive())
                        )
                        .map(item ->
                                purchaseOrderItemMapper.toResponse(
                                        item.getPurchaseOrderItem()
                                )
                        )
                        .toList()
        );

        response.setPurchaseOrder(
                purchaseOrderMapper.toResponse(purchaseOrder)
        );

        return response;
    }


    // =====================================================
    // GET GOODS RECEIPTS BY PURCHASE ORDER
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderGoodsReceiptResponse>
    getGoodsReceiptsByPurchaseOrderId(Long purchaseOrderId) {

        PurchaseOrderEntity purchaseOrder =
                purchaseOrderRepository.findByIdAndActiveTrue(purchaseOrderId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Purchase Order not found with id: "
                                                + purchaseOrderId
                                )
                        );

        List<PurchaseOrderGoodsReceiptEntity> receipts =
                goodsReceiptRepository
                        .findAllByPurchaseOrderIdAndActiveTrueOrderByReceiptDateDesc(
                                purchaseOrderId
                        );

        return receipts.stream()
                .map(receipt -> {

                    PurchaseOrderGoodsReceiptResponse response =
                            new PurchaseOrderGoodsReceiptResponse();

                    response.setPurchaseOrderId(purchaseOrder.getId());
                    response.setOrderNo(purchaseOrder.getOrderNo());
                    response.setReceiptDate(receipt.getReceiptDate());

                    response.setMessage(
                            "Goods Receipt fetched successfully."
                    );

                    response.setItems(
                            receipt.getItems()
                                    .stream()
                                    .filter(item ->
                                            Boolean.TRUE.equals(item.getActive())
                                    )
                                    .map(item ->
                                            purchaseOrderItemMapper.toResponse(
                                                    item.getPurchaseOrderItem()
                                            )
                                    )
                                    .toList()
                    );

                    response.setPurchaseOrder(
                            purchaseOrderMapper.toResponse(purchaseOrder)
                    );

                    return response;
                })
                .toList();
    }


    // =====================================================
    // RESOLVE PURCHASE ORDER REFERENCES
    // =====================================================

    private OrderReferences resolveOrderReferences(
            PurchaseOrderRequest request
    ) {

        PartyEntity supplier =
                purchaseOrderValidation.validateSupplier(
                        request.getPartyId()
                );

        WarehouseEntity warehouse =
                purchaseOrderValidation.validateWarehouse(
                        request.getWarehouseId()
                );

        Currency currency =
                purchaseOrderValidation.validateCurrency(
                        request.getCurrencyId()
                );

        return new OrderReferences(
                supplier,
                warehouse,
                currency
        );
    }

    private record OrderReferences(
            PartyEntity supplier,
            WarehouseEntity warehouse,
            Currency currency
    ) {
    }


    // =====================================================
    // CREATE PURCHASE ORDER ITEM
    // =====================================================

    private PurchaseOrderItemEntity createPurchaseOrderItem(
            PurchaseOrderItemRequest request
    ) {

        if (request == null) {
            throw new BadRequestException(
                    "Purchase Order item is required."
            );
        }

        ProductEntity product =
                purchaseOrderValidation.validateProduct(
                        request.getProductId()
                );

        UnitEntity unit =
                purchaseOrderValidation.validateUnit(
                        request.getUnitId(),
                        request.getProductId()
                );

        SizeEntity size = request.getSizeId() != null
                ? purchaseOrderValidation.validateSize(
                request.getSizeId(),
                request.getProductId()
        )
                : null;

        TaxMasterEntity taxMaster =
                request.getTaxMasterId() != null
                        ? purchaseOrderValidation.validateTaxMaster(
                        request.getTaxMasterId()
                )
                        : null;

        BigDecimal quantity = request.getQuantity();

        if (quantity == null || quantity.signum() <= 0) {
            throw new BadRequestException(
                    "Purchase Order item quantity must be greater than zero."
            );
        }

        BigDecimal baseUnitPrice = request.getBaseUnitPrice();

        if (baseUnitPrice == null || baseUnitPrice.signum() < 0) {
            throw new BadRequestException(
                    "Base unit price in INR is required and cannot be negative."
            );
        }

        PurchaseOrderItemEntity item =
                new PurchaseOrderItemEntity();

        item.setProduct(product);
        item.setDescription(request.getDescription());

        item.setUnit(unit);
        item.setSize(size);

        item.setQuantity(quantity);
        item.setReceivedQuantity(ZERO);

        item.setBaseUnitPrice(
                baseUnitPrice.setScale(
                        PRICE_SCALE,
                        RoundingMode.HALF_UP
                )
        );

        item.setDiscountType(request.getDiscountType());
        item.setDiscountValue(
                zeroIfNull(request.getDiscountValue())
        );

        item.setTaxMaster(taxMaster);

        item.setActive(true);

        return item;
    }


    // =====================================================
    // PURCHASE ORDER CALCULATIONS
    // =====================================================

    private void calculatePurchaseOrder(
            PurchaseOrderEntity purchaseOrder
    ) {

        if (companyRegisteredState == null
                || companyRegisteredState.isBlank()) {

            throw new BadRequestException(
                    "Company registered state is not configured."
            );
        }

        PurchaseOrderTaxType taxType =
                purchaseOrderTaxTypeResolver.resolveTaxType(
                        companyRegisteredState,
                        purchaseOrder.getParty()
                );

        calculationService.calculate(
                purchaseOrder,
                taxType
        );
    }


    // =====================================================
    // EXCHANGE RATE
    //
    // Same convention as Sales Order:
    // One selected currency unit = exchangeRate INR.
    // =====================================================

    private BigDecimal resolveExchangeRate(
            Currency currency,
            LocalDate orderDate
    ) {

        Currency baseCurrency = currencyRepository
                .findByCurrencyCodeIgnoreCase("INR")
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Base currency INR is not configured."
                        )
                );

        BigDecimal exchangeRate;

        if (currency.getCurrencyCode().equalsIgnoreCase("INR")) {

            exchangeRate = BigDecimal.ONE;

        } else {

            LocalDate rateDate = orderDate != null
                    ? orderDate
                    : LocalDate.now();

            var rateResponse = exchangeRateService.getRate(
                    currency.getId(),
                    baseCurrency.getId(),
                    rateDate
            );

            if (rateResponse == null
                    || rateResponse.getData() == null
                    || rateResponse.getData().getRate() == null) {

                throw new BadRequestException(
                        "Unable to fetch exchange rate from "
                                + currency.getCurrencyCode()
                                + " to INR."
                );
            }

            exchangeRate = rateResponse.getData().getRate();
        }

        if (exchangeRate.signum() <= 0) {
            throw new BadRequestException(
                    "Exchange rate must be greater than zero."
            );
        }

        return exchangeRate;
    }


    // =====================================================
    // DELIVERY DATE VALIDATION
    // =====================================================

    private void validateDeliveryDate(
            LocalDate orderDate,
            LocalDate expectedDeliveryDate
    ) {

        if (expectedDeliveryDate != null
                && expectedDeliveryDate.isBefore(orderDate)) {

            throw new BadRequestException(
                    "Expected delivery date cannot be before order date."
            );
        }
    }


    // =====================================================
    // PURCHASE ORDER NUMBER
    // =====================================================

    private String generatePurchaseOrderNumber() {

        String orderNo;

        do {

            orderNo = "PO-"
                    + Year.now().getValue()
                    + "-"
                    + UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase();

        } while (
                purchaseOrderRepository.existsByOrderNoIgnoreCase(orderNo)
        );

        return orderNo;
    }


    // =====================================================
    // GOODS RECEIPT NUMBER
    // =====================================================

    private String generateGoodsReceiptNumber() {

        String receiptNo;

        do {

            receiptNo = "PR-"
                    + Year.now().getValue()
                    + "-"
                    + UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase();

        } while (
                goodsReceiptRepository.existsByReceiptNoIgnoreCase(receiptNo)
        );

        return receiptNo;
    }


    // =====================================================
    // MONEY
    // =====================================================

    private BigDecimal money(BigDecimal value) {

        return zeroIfNull(value).setScale(
                MONEY_SCALE,
                RoundingMode.HALF_UP
        );
    }


    // =====================================================
    // NULL TO ZERO
    // =====================================================

    private BigDecimal zeroIfNull(BigDecimal value) {

        return value != null ? value : ZERO;
    }
}