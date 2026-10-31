
package com.ims.service.impl.saleOrder;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.exchange.ExchangeRateResponseDTO;
import com.ims.dtos.saleOrder.SalesOrderItemRequest;
import com.ims.dtos.saleOrder.SalesOrderRequest;
import com.ims.dtos.saleOrder.SalesOrderResponse;
import com.ims.dtos.saleOrder.SalesOrderSearchRequest;
import com.ims.entity.*;
import com.ims.enums.*;
import com.ims.exception.BadRequestException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.exception.ValidationException;
import com.ims.mapper.saleOrder.SaleOrderMapper;
import com.ims.repository.CurrencyRepository;
import com.ims.repository.SaleOrderRepository;
import com.ims.service.serviceInterface.currency.ExchangeRateService;
import com.ims.service.serviceInterface.inventory.InventoryService;
import com.ims.service.serviceInterface.saleOrder.SaleOrderService;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.specification.SaleOrderSpecification;
import com.ims.utils.validation.SaleOrderValidation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SaleOrderServiceImpl implements SaleOrderService {

    private static final int MONEY_SCALE = 2;
    private static final int PRICE_SCALE = 4;

    private static final BigDecimal HUNDRED =
            BigDecimal.valueOf(100);

    private final SaleOrderRepository salesOrderRepository;
    private final CurrencyRepository currencyRepository;
    private final SaleOrderMapper saleOrderMapper;
    private final ExchangeRateService exchangeRateService;
    private final BaseEntityUtil baseEntityUtil;
    private final SaleOrderValidation saleOrderValidation;
    private final InventoryService inventoryService;

    // =====================================================
    // CREATE SALES ORDER
    // =====================================================

    @Override
    public ApiResponse<SalesOrderResponse> createSalesOrder(
            SalesOrderRequest request
    ) {

        log.info("Creating Sales Order");

        validateRequest(request);

        OrderReferences references =
                resolveOrderReferences(request);

        LocalDate orderDate = request.getOrderDate() != null
                ? request.getOrderDate()
                : LocalDate.now();

        BigDecimal exchangeRate = resolveExchangeRate(
                references.currency(),
                orderDate
        );

        SalesOrderEntity salesOrder = new SalesOrderEntity();

        salesOrder.setOrderNo(generateSalesOrderNumber());
        salesOrder.setPartyType(request.getPartyType());
        salesOrder.setCustomer(references.customer());
        salesOrder.setParty(references.party());
        salesOrder.setWarehouse(references.warehouse());
        salesOrder.setCurrency(references.currency());
        salesOrder.setExchangeRate(exchangeRate);

        salesOrder.setOrderDate(orderDate);
        salesOrder.setExpectedDeliveryDate(
                request.getExpectedDeliveryDate()
        );

        salesOrder.setNotes(request.getNotes());

        // New orders must always start as DRAFT.
        // Never accept CONFIRMED or DISPATCHED from the request.
        salesOrder.setSalesOrderStatus(SaleOrderStatus.DRAFT);

        salesOrder.setDiscountType(request.getDiscountType());
        salesOrder.setDiscountValue(
                zeroIfNull(request.getDiscountValue())
        );

        salesOrder.setActive(true);

        for (SalesOrderItemRequest itemRequest : request.getItems()) {

            SalesOrderItemEntity item =
                    createSalesOrderItem(
                            itemRequest,
                            exchangeRate
                    );

            item.setSalesOrder(salesOrder);

            baseEntityUtil.prepareForCreate(item);

            salesOrder.getItems().add(item);
        }

        calculateSalesOrderTotals(salesOrder);

        // Validate stock only. Do not deduct stock during creation.
        inventoryService.validateSalesOrderStock(salesOrder);

        baseEntityUtil.prepareForCreate(salesOrder);

        SalesOrderEntity savedSalesOrder =
                salesOrderRepository.save(salesOrder);

        log.info(
                "Sales Order {} created successfully.",
                savedSalesOrder.getOrderNo()
        );

        return ApiResponse.success(
                saleOrderMapper.toResponse(savedSalesOrder),
                "Sales Order created successfully."
        );
    }

    // =====================================================
    // GET SALES ORDER BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<SalesOrderResponse> getSalesOrderById(
            Long id
    ) {

        SalesOrderEntity salesOrder =
                salesOrderRepository.findByIdAndActiveTrue(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Sales Order not found with id: " + id
                                )
                        );

        return ApiResponse.success(
                saleOrderMapper.toResponse(salesOrder),
                "Sales Order fetched successfully."
        );
    }

    // =====================================================
    // GET ALL SALES ORDERS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<SalesOrderResponse>> getAllSalesOrders(
            SalesOrderSearchRequest request,
            Pageable pageable
    ) {

        Specification<SalesOrderEntity> specification =
                SaleOrderSpecification.withFilters(request);

        Page<SalesOrderEntity> salesOrders =
                salesOrderRepository.findAll(
                        specification,
                        pageable
                );

        return ApiResponse.success(
                toPageResponse(salesOrders),
                "Sales Orders fetched successfully."
        );
    }

    // =====================================================
    // UPDATE SALES ORDER
    // =====================================================

    @Override
    public ApiResponse<SalesOrderResponse> updateSalesOrder(
            Long id,
            SalesOrderRequest request
    ) {

        log.info("Updating Sales Order: {}", id);

        validateRequest(request);

        SalesOrderEntity salesOrder =
                salesOrderRepository.findActiveByIdForUpdate(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Sales Order not found with id: " + id
                                )
                        );

        // Only DRAFT orders can be edited.
        if (salesOrder.getSalesOrderStatus() != SaleOrderStatus.DRAFT) {

            throw new BadRequestException(
                    "Only DRAFT Sales Orders can be updated. " +
                            "Current status: " +
                            salesOrder.getSalesOrderStatus()
            );
        }

        OrderReferences references =
                resolveOrderReferences(request);

        LocalDate orderDate = request.getOrderDate() != null
                ? request.getOrderDate()
                : salesOrder.getOrderDate();

        validateDeliveryDate(
                orderDate,
                request.getExpectedDeliveryDate()
        );

        BigDecimal exchangeRate = resolveExchangeRate(
                references.currency(),
                orderDate
        );

        salesOrder.setPartyType(request.getPartyType());
        salesOrder.setCustomer(references.customer());
        salesOrder.setParty(references.party());
        salesOrder.setWarehouse(references.warehouse());
        salesOrder.setCurrency(references.currency());
        salesOrder.setExchangeRate(exchangeRate);

        salesOrder.setOrderDate(orderDate);
        salesOrder.setExpectedDeliveryDate(
                request.getExpectedDeliveryDate()
        );

        salesOrder.setNotes(request.getNotes());

        salesOrder.setDiscountType(request.getDiscountType());
        salesOrder.setDiscountValue(
                zeroIfNull(request.getDiscountValue())
        );

        // Do not update status from the request.
        // Status transitions must use confirm, dispatch or cancel operations.

        // Replace items.
        // Ensure no other entity has a foreign key to these item IDs
        // before using orphanRemoval for replacement.
        salesOrder.getItems().clear();

        for (SalesOrderItemRequest itemRequest : request.getItems()) {

            SalesOrderItemEntity item =
                    createSalesOrderItem(
                            itemRequest,
                            exchangeRate
                    );

            item.setSalesOrder(salesOrder);

            baseEntityUtil.prepareForCreate(item);

            salesOrder.getItems().add(item);
        }

        calculateSalesOrderTotals(salesOrder);

        // Validate the updated quantities. Do not deduct stock.
        inventoryService.validateSalesOrderStock(salesOrder);

        baseEntityUtil.prepareForUpdate(salesOrder);

        SalesOrderEntity savedSalesOrder =
                salesOrderRepository.save(salesOrder);

        log.info(
                "Sales Order {} updated successfully.",
                savedSalesOrder.getOrderNo()
        );

        return ApiResponse.success(
                saleOrderMapper.toResponse(savedSalesOrder),
                "Sales Order updated successfully."
        );
    }

    // =====================================================
    // CONFIRM SALES ORDER
    // =====================================================

    @Override
    public ApiResponse<SalesOrderResponse> confirmSalesOrder(Long id) {

        log.info("Confirming Sales Order: {}", id);

        SalesOrderEntity salesOrder =
                salesOrderRepository.findActiveByIdForUpdate(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Sales Order not found with id: " + id
                                )
                        );

        if (salesOrder.getSalesOrderStatus() ==
                SaleOrderStatus.CANCELLED) {

            throw new BadRequestException(
                    "Cannot confirm a cancelled Sales Order."
            );
        }

        if (salesOrder.getSalesOrderStatus() ==
                SaleOrderStatus.DISPATCHED) {

            throw new BadRequestException(
                    "A dispatched Sales Order cannot be confirmed."
            );
        }

        if (salesOrder.getSalesOrderStatus() ==
                SaleOrderStatus.CONFIRMED) {

            throw new BadRequestException(
                    "Sales Order is already confirmed."
            );
        }

        if (salesOrder.getSalesOrderStatus() !=
                SaleOrderStatus.DRAFT) {

            throw new BadRequestException(
                    "Only DRAFT Sales Orders can be confirmed."
            );
        }

        // Recheck stock before confirmation.
        // Confirmation does not deduct stock.
        inventoryService.validateSalesOrderStock(salesOrder);

        salesOrder.setSalesOrderStatus(
                SaleOrderStatus.CONFIRMED
        );

        baseEntityUtil.prepareForUpdate(salesOrder);

        SalesOrderEntity savedSalesOrder =
                salesOrderRepository.save(salesOrder);

        log.info(
                "Sales Order {} confirmed successfully.",
                savedSalesOrder.getOrderNo()
        );

        return ApiResponse.success(
                saleOrderMapper.toResponse(savedSalesOrder),
                "Sales Order confirmed successfully."
        );
    }

    // =====================================================
    // DISPATCH SALES ORDER
    // =====================================================

    @Override
    public ApiResponse<SalesOrderResponse> dispatchSalesOrder(Long id) {

        log.info("Dispatching Sales Order: {}", id);

        // Lock the Sales Order row to prevent concurrent dispatch.
        SalesOrderEntity salesOrder =
                salesOrderRepository.findActiveByIdForUpdate(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Sales Order not found with id: " + id
                                )
                        );

        if (salesOrder.getSalesOrderStatus() ==
                SaleOrderStatus.DRAFT) {

            throw new BadRequestException(
                    "Cannot dispatch a cancelled Sales Order."
            );
        }

        if (salesOrder.getSalesOrderStatus() ==
                SaleOrderStatus.DISPATCHED) {

            throw new BadRequestException(
                    "Sales Order is already dispatched."
            );
        }

        // Dispatch is allowed only after confirmation.
        if (salesOrder.getSalesOrderStatus() !=
                SaleOrderStatus.CONFIRMED) {

            throw new BadRequestException(
                    "Only CONFIRMED Sales Orders can be dispatched. " +
                            "Current status: " +
                            salesOrder.getSalesOrderStatus()
            );
        }

        /*
         * InventoryService must:
         * 1. Lock the required stock rows.
         * 2. Validate all item quantities before deducting any stock.
         * 3. Deduct stock.
         * 4. Create inventory transaction ledger entries.
         *
         * If any operation fails, the transaction must roll back.
         */
        inventoryService.dispatchSalesOrder(salesOrder);

        // Change status only after inventory dispatch succeeds.
        salesOrder.setSalesOrderStatus(
                SaleOrderStatus.DISPATCHED
        );

        baseEntityUtil.prepareForUpdate(salesOrder);

        SalesOrderEntity savedSalesOrder =
                salesOrderRepository.save(salesOrder);

        log.info(
                "Sales Order {} dispatched successfully.",
                savedSalesOrder.getOrderNo()
        );

        return ApiResponse.success(
                saleOrderMapper.toResponse(savedSalesOrder),
                "Sales Order dispatched successfully."
        );
    }

    // =====================================================
    // CANCEL SALES ORDER
    // =====================================================

    @Override
    public ApiResponse<SalesOrderResponse> cancelSalesOrder(Long id) {

        SalesOrderEntity salesOrder =
                salesOrderRepository.findActiveByIdForUpdate(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Sales Order not found with id: " + id
                                )
                        );

        if (salesOrder.getSalesOrderStatus() ==
                SaleOrderStatus.CANCELLED) {

            throw new BadRequestException(
                    "Sales Order is already cancelled."
            );
        }

        // A dispatched order requires a separate stock-return workflow.
        if (salesOrder.getSalesOrderStatus() ==
                SaleOrderStatus.DISPATCHED) {

            throw new BadRequestException(
                    "Cannot cancel a dispatched Sales Order. " +
                            "Use the sales return or stock reversal workflow."
            );
        }

        salesOrder.setSalesOrderStatus(
                SaleOrderStatus.CANCELLED
        );

        baseEntityUtil.prepareForUpdate(salesOrder);

        SalesOrderEntity savedSalesOrder =
                salesOrderRepository.save(salesOrder);

        return ApiResponse.success(
                saleOrderMapper.toResponse(savedSalesOrder),
                "Sales Order cancelled successfully."
        );
    }

    // =====================================================
    // DELETE / DEACTIVATE SALES ORDER
    // =====================================================

    @Override
    public ApiResponse<Void> deleteSalesOrder(Long id) {

        SalesOrderEntity salesOrder =
                salesOrderRepository.findActiveByIdForUpdate(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Sales Order not found with id: " + id
                                )
                        );

        if (salesOrder.getSalesOrderStatus() ==
                SaleOrderStatus.DISPATCHED) {

            throw new BadRequestException(
                    "Cannot delete a dispatched Sales Order."
            );
        }

        salesOrder.setActive(false);

        baseEntityUtil.prepareForUpdate(salesOrder);

        salesOrderRepository.save(salesOrder);

        return ApiResponse.success(
                null,
                "Sales Order deleted successfully."
        );
    }

    // =====================================================
    // RESOLVE REFERENCES
    // =====================================================

    private OrderReferences resolveOrderReferences(
            SalesOrderRequest request
    ) {

        saleOrderValidation.validatePartyType(
                request.getPartyType(),
                request.getCustomerId(),
                request.getPartyId()
        );

        CustomerEntity customer = null;
        PartyEntity party = null;

        if (request.getPartyType() == SaleOrderPartyType.CUSTOMER) {

            customer = saleOrderValidation.validateCustomer(
                    request.getCustomerId()
            );

        } else if (request.getPartyType() == SaleOrderPartyType.PARTY) {

            party = saleOrderValidation.validateParty(
                    request.getPartyId()
            );

        }else if (request.getPartyType() == SaleOrderPartyType.BOTH) {

            party = saleOrderValidation.validateParty(
                    request.getPartyId()
            );
        }


        WarehouseEntity warehouse =
                saleOrderValidation.validateWarehouse(
                        request.getWarehouseId()
                );

        Currency currency =
                saleOrderValidation.validateCurrency(
                        request.getCurrencyId()
                );

        return new OrderReferences(
                customer,
                party,
                warehouse,
                currency
        );
    }

    private record OrderReferences(
            CustomerEntity customer,
            PartyEntity party,
            WarehouseEntity warehouse,
            Currency currency
    ) {
    }

    // =====================================================
    // CREATE SALES ORDER ITEM
    // =====================================================

    private SalesOrderItemEntity createSalesOrderItem(
            SalesOrderItemRequest request,
            BigDecimal exchangeRate
    ) {

        if (request == null) {
            throw new BadRequestException(
                    "Sales Order item is required."
            );
        }

        if (request.getProductId() == null) {
            throw new BadRequestException(
                    "Product is required."
            );
        }

        ProductEntity product =
                saleOrderValidation.validateProduct(
                        request.getProductId()
                );

        UnitEntity unit = request.getUnitId() != null
                ? saleOrderValidation.validateUnit(
                request.getUnitId(),
                request.getProductId()
        )
                : null;

        SizeEntity size = request.getSizeId() != null
                ? saleOrderValidation.validateSize(
                request.getSizeId(),
                request.getProductId()
        )
                : null;

        TaxMasterEntity taxMaster =
                request.getTaxMasterId() != null
                        ? saleOrderValidation.validateTaxMaster(
                        request.getTaxMasterId()
                )
                        : null;

        // Quantity
        BigDecimal quantity = request.getQuantity();

        if (quantity == null || quantity.signum() <= 0) {
            throw new BadRequestException(
                    "Item quantity must be greater than zero."
            );
        }

        // Exchange rate
        if (exchangeRate == null || exchangeRate.signum() <= 0) {
            throw new BadRequestException(
                    "Exchange rate must be greater than zero."
            );
        }

        // Base unit price is always INR.
        BigDecimal baseUnitPrice = request.getBaseUnitPrice();

        if (baseUnitPrice == null) {
            throw new BadRequestException(
                    "Base unit price in INR is required."
            );
        }

        if (baseUnitPrice.signum() < 0) {
            throw new BadRequestException(
                    "Base unit price cannot be negative."
            );
        }

        baseUnitPrice = baseUnitPrice.setScale(
                PRICE_SCALE,
                RoundingMode.HALF_UP
        );

        // Convert INR to selected currency.
        BigDecimal unitPrice = baseUnitPrice.divide(
                exchangeRate,
                PRICE_SCALE,
                RoundingMode.HALF_UP
        );

        BigDecimal lineAmount = money(
                quantity.multiply(unitPrice)
        );

        BigDecimal baseLineAmount = money(
                lineAmount.multiply(exchangeRate)
        );

        // Item discount
        SaleOrderDiscountType discountType =
                request.getDiscountType() != null
                        ? request.getDiscountType()
                        : SaleOrderDiscountType.AMOUNT;

        BigDecimal discountValue = zeroIfNull(
                request.getDiscountValue()
        );

        BigDecimal discountAmount = calculateDiscount(
                lineAmount,
                discountType,
                discountValue,
                "Item"
        );

        BigDecimal baseDiscountAmount = money(
                discountAmount.multiply(exchangeRate)
        );

        BigDecimal taxableAmount = money(
                lineAmount.subtract(discountAmount)
        );

        BigDecimal baseTaxableAmount = money(
                taxableAmount.multiply(exchangeRate)
        );

        // Tax rates
        BigDecimal cgstRate = BigDecimal.ZERO;
        BigDecimal sgstRate = BigDecimal.ZERO;
        BigDecimal igstRate = BigDecimal.ZERO;

        if (taxMaster != null) {
            cgstRate = zeroIfNull(taxMaster.getCgstRate());
            sgstRate = zeroIfNull(taxMaster.getSgstRate());
            igstRate = zeroIfNull(taxMaster.getIgstRate());
        }

        validateTaxRates(cgstRate, sgstRate, igstRate);

        BigDecimal taxRate = cgstRate
                .add(sgstRate)
                .add(igstRate);

        // GST calculation
        BigDecimal cgstAmount = calculatePercentage(
                taxableAmount,
                cgstRate
        );

        BigDecimal sgstAmount = calculatePercentage(
                taxableAmount,
                sgstRate
        );

        BigDecimal igstAmount = calculatePercentage(
                taxableAmount,
                igstRate
        );

        BigDecimal totalTaxAmount = money(
                cgstAmount
                        .add(sgstAmount)
                        .add(igstAmount)
        );

        BigDecimal totalAmount = money(
                taxableAmount.add(totalTaxAmount)
        );

        // Base currency tax and total (INR)
        BigDecimal baseCgstAmount = money(
                cgstAmount.multiply(exchangeRate)
        );

        BigDecimal baseSgstAmount = money(
                sgstAmount.multiply(exchangeRate)
        );

        BigDecimal baseIgstAmount = money(
                igstAmount.multiply(exchangeRate)
        );

        BigDecimal baseTotalTaxAmount = money(
                totalTaxAmount.multiply(exchangeRate)
        );

        BigDecimal baseTotalAmount = money(
                totalAmount.multiply(exchangeRate)
        );

        // Build Sales Order item
        SalesOrderItemEntity item = new SalesOrderItemEntity();

        item.setProduct(product);
        item.setDescription(request.getDescription());

        item.setUnit(unit);
        item.setSize(size);
        item.setQuantity(quantity);

        item.setBaseUnitPrice(baseUnitPrice);
        item.setUnitPrice(unitPrice);

        item.setLineAmount(lineAmount);
        item.setBaseLineAmount(baseLineAmount);

        item.setDiscountType(discountType);
        item.setDiscountValue(discountValue);
        item.setDiscountAmount(discountAmount);
        item.setBaseDiscountAmount(baseDiscountAmount);

        item.setTaxMaster(taxMaster);
        item.setTaxRate(taxRate);

        item.setCgstRate(cgstRate);
        item.setSgstRate(sgstRate);
        item.setIgstRate(igstRate);

        item.setTaxableAmount(taxableAmount);
        item.setBaseTaxableAmount(baseTaxableAmount);

        item.setCgstAmount(cgstAmount);
        item.setSgstAmount(sgstAmount);
        item.setIgstAmount(igstAmount);

        item.setTotalTaxAmount(totalTaxAmount);
        item.setBaseTotalTaxAmount(baseTotalTaxAmount);

        item.setTotalAmount(totalAmount);
        item.setBaseTotalAmount(baseTotalAmount);

        return item;
    }

    // =====================================================
    // CALCULATE SALES ORDER TOTALS
    // =====================================================

    private void calculateSalesOrderTotals(
            SalesOrderEntity salesOrder
    ) {

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal itemDiscountTotal = BigDecimal.ZERO;

        for (SalesOrderItemEntity item : salesOrder.getItems()) {

            subtotal = subtotal.add(
                    zeroIfNull(item.getLineAmount())
            );

            itemDiscountTotal = itemDiscountTotal.add(
                    zeroIfNull(item.getDiscountAmount())
            );
        }

        subtotal = money(subtotal);
        itemDiscountTotal = money(itemDiscountTotal);

        BigDecimal afterItemDiscount = money(
                subtotal.subtract(itemDiscountTotal)
        );

        if (afterItemDiscount.signum() < 0) {
            throw new BadRequestException(
                    "Item discounts cannot exceed subtotal."
            );
        }

        BigDecimal orderDiscountAmount = calculateDiscount(
                afterItemDiscount,
                salesOrder.getDiscountType(),
                zeroIfNull(salesOrder.getDiscountValue()),
                "Order"
        );

        if (orderDiscountAmount.compareTo(afterItemDiscount) > 0) {
            throw new BadRequestException(
                    "Order discount cannot exceed amount after item discounts."
            );
        }

        BigDecimal taxableAfterAllDiscounts = money(
                afterItemDiscount.subtract(orderDiscountAmount)
        );

        BigDecimal totalDiscount = money(
                itemDiscountTotal.add(orderDiscountAmount)
        );

        BigDecimal totalCgstAmount = BigDecimal.ZERO;
        BigDecimal totalSgstAmount = BigDecimal.ZERO;
        BigDecimal totalIgstAmount = BigDecimal.ZERO;
        BigDecimal totalTaxAmount = BigDecimal.ZERO;
        BigDecimal grandTotal = BigDecimal.ZERO;

        BigDecimal allocatedDiscount = BigDecimal.ZERO;

        List<SalesOrderItemEntity> items = salesOrder.getItems();

        for (int i = 0; i < items.size(); i++) {

            SalesOrderItemEntity item = items.get(i);

            BigDecimal originalTaxable = zeroIfNull(
                    item.getTaxableAmount()
            );

            BigDecimal itemOrderDiscount = BigDecimal.ZERO;

            if (afterItemDiscount.signum() > 0 &&
                    orderDiscountAmount.signum() > 0) {

                if (i == items.size() - 1) {

                    itemOrderDiscount = orderDiscountAmount
                            .subtract(allocatedDiscount);

                } else {

                    itemOrderDiscount = orderDiscountAmount
                            .multiply(originalTaxable)
                            .divide(
                                    afterItemDiscount,
                                    MONEY_SCALE + 6,
                                    RoundingMode.HALF_UP
                            );

                    allocatedDiscount = allocatedDiscount.add(
                            itemOrderDiscount
                    );
                }
            }

            BigDecimal finalItemTaxable = money(
                    originalTaxable.subtract(itemOrderDiscount)
            );

            if (finalItemTaxable.signum() < 0) {
                throw new BadRequestException(
                        "Calculated item taxable amount cannot be negative."
                );
            }

            BigDecimal cgstAmount = calculatePercentage(
                    finalItemTaxable,
                    zeroIfNull(item.getCgstRate())
            );

            BigDecimal sgstAmount = calculatePercentage(
                    finalItemTaxable,
                    zeroIfNull(item.getSgstRate())
            );

            BigDecimal igstAmount = calculatePercentage(
                    finalItemTaxable,
                    zeroIfNull(item.getIgstRate())
            );

            BigDecimal itemTaxAmount = money(
                    cgstAmount.add(sgstAmount).add(igstAmount)
            );

            BigDecimal itemTotalAmount = money(
                    finalItemTaxable.add(itemTaxAmount)
            );

            BigDecimal exchangeRate = salesOrder.getExchangeRate();

            // Selected currency amounts
            item.setTaxableAmount(finalItemTaxable);
            item.setCgstAmount(cgstAmount);
            item.setSgstAmount(sgstAmount);
            item.setIgstAmount(igstAmount);
            item.setTotalTaxAmount(itemTaxAmount);
            item.setTotalAmount(itemTotalAmount);

            // INR amounts
            item.setBaseTaxableAmount(
                    money(finalItemTaxable.multiply(exchangeRate))
            );

            item.setBaseTotalTaxAmount(
                    money(itemTaxAmount.multiply(exchangeRate))
            );

            item.setBaseTotalAmount(
                    money(itemTotalAmount.multiply(exchangeRate))
            );

            totalCgstAmount = totalCgstAmount.add(cgstAmount);
            totalSgstAmount = totalSgstAmount.add(sgstAmount);
            totalIgstAmount = totalIgstAmount.add(igstAmount);
            totalTaxAmount = totalTaxAmount.add(itemTaxAmount);
            grandTotal = grandTotal.add(itemTotalAmount);
        }

        totalCgstAmount = money(totalCgstAmount);
        totalSgstAmount = money(totalSgstAmount);
        totalIgstAmount = money(totalIgstAmount);
        totalTaxAmount = money(totalTaxAmount);
        grandTotal = money(grandTotal);

        BigDecimal exchangeRate = salesOrder.getExchangeRate();

        // Selected currency financial summary
        salesOrder.setSubtotal(subtotal);
        salesOrder.setDiscountAmount(totalDiscount);
        salesOrder.setTaxableAmount(taxableAfterAllDiscounts);

        salesOrder.setCgstAmount(totalCgstAmount);
        salesOrder.setSgstAmount(totalSgstAmount);
        salesOrder.setIgstAmount(totalIgstAmount);

        salesOrder.setTotalTaxAmount(totalTaxAmount);
        salesOrder.setGrandTotal(grandTotal);

        // INR financial summary
        salesOrder.setBaseSubtotal(
                money(subtotal.multiply(exchangeRate))
        );

        salesOrder.setBaseDiscountAmount(
                money(totalDiscount.multiply(exchangeRate))
        );

        salesOrder.setBaseTaxableAmount(
                money(taxableAfterAllDiscounts.multiply(exchangeRate))
        );

        salesOrder.setBaseTotalTaxAmount(
                money(totalTaxAmount.multiply(exchangeRate))
        );

        salesOrder.setBaseGrandTotal(
                money(grandTotal.multiply(exchangeRate))
        );
    }

    // =====================================================
    // DISCOUNT CALCULATION
    // =====================================================

    private BigDecimal calculateDiscount(
            BigDecimal amount,
            SaleOrderDiscountType discountType,
            BigDecimal discountValue,
            String label
    ) {

        amount = money(amount);
        discountValue = zeroIfNull(discountValue);

        if (discountValue.signum() < 0) {
            throw new BadRequestException(
                    label + " discount cannot be negative."
            );
        }

        if (discountValue.signum() == 0) {
            return BigDecimal.ZERO.setScale(MONEY_SCALE);
        }

        if (discountType == null) {
            throw new BadRequestException(
                    label + " discount type is required."
            );
        }

        if (discountType == SaleOrderDiscountType.PERCENTAGE) {

            if (discountValue.compareTo(HUNDRED) > 0) {
                throw new BadRequestException(
                        label + " discount percentage cannot exceed 100."
                );
            }

            return calculatePercentage(amount, discountValue);
        }

        BigDecimal discount = money(discountValue);

        if (discount.compareTo(amount) > 0) {
            throw new BadRequestException(
                    label + " discount (" + discount +
                            ") cannot exceed the applicable amount (" +
                            amount +
                            "). Both values must be in the selected currency."
            );
        }

        return discount;
    }

    // =====================================================
    // TAX RATE VALIDATION
    // =====================================================

    private void validateTaxRates(
            BigDecimal cgstRate,
            BigDecimal sgstRate,
            BigDecimal igstRate
    ) {

        validateSingleTaxRate(cgstRate, "CGST");
        validateSingleTaxRate(sgstRate, "SGST");
        validateSingleTaxRate(igstRate, "IGST");
    }

    private void validateSingleTaxRate(
            BigDecimal rate,
            String name
    ) {

        if (rate.signum() < 0 || rate.compareTo(HUNDRED) > 0) {
            throw new BadRequestException(
                    name + " rate must be between 0 and 100."
            );
        }
    }

    // =====================================================
    // RESOLVE EXCHANGE RATE
    // Convention: INR per one selected currency unit
    // =====================================================

    private BigDecimal resolveExchangeRate(
            Currency currency,
            LocalDate orderDate
    ) {

        Currency baseCurrency = currencyRepository
                .findByCurrencyCodeIgnoreCase("INR")
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Base currency INR is not configured"
                        )
                );

        BigDecimal exchangeRate;

        if (currency.getCurrencyCode().equalsIgnoreCase("INR")) {

            exchangeRate = BigDecimal.ONE;

        } else {

            LocalDate rateDate = orderDate != null
                    ? orderDate
                    : LocalDate.now();

            ApiResponse<ExchangeRateResponseDTO> rateResponse =
                    exchangeRateService.getRate(
                            currency.getId(),
                            baseCurrency.getId(),
                            rateDate
                    );

            if (rateResponse == null
                    || rateResponse.getData() == null
                    || rateResponse.getData().getRate() == null) {

                throw new BadRequestException(
                        "Unable to fetch exchange rate from "
                                + currency.getCurrencyCode() + " to INR"
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
    // VALIDATE REQUEST
    // =====================================================

    private void validateRequest(SalesOrderRequest request) {

        if (request == null) {
            throw new BadRequestException(
                    "Sales Order request is required."
            );
        }

        if (request.getPartyType() == null) {
            throw new BadRequestException(
                    "Party type is required."
            );
        }

        if (request.getWarehouseId() == null) {
            throw new BadRequestException(
                    "Warehouse is required."
            );
        }

        if (request.getCurrencyId() == null) {
            throw new BadRequestException(
                    "Currency is required."
            );
        }

        if (request.getItems() == null ||
                request.getItems().isEmpty()) {

            throw new BadRequestException(
                    "At least one Sales Order item is required."
            );
        }

        for (SalesOrderItemRequest item : request.getItems()) {

            if (item == null) {
                throw new BadRequestException(
                        "Sales Order item cannot be null."
                );
            }
        }

        LocalDate orderDate = request.getOrderDate() != null
                ? request.getOrderDate()
                : LocalDate.now();

        validateDeliveryDate(
                orderDate,
                request.getExpectedDeliveryDate()
        );

        BigDecimal orderDiscountValue = zeroIfNull(
                request.getDiscountValue()
        );

        if (orderDiscountValue.signum() < 0) {
            throw new BadRequestException(
                    "Order discount cannot be negative."
            );
        }

        if (orderDiscountValue.signum() > 0 &&
                request.getDiscountType() == null) {

            throw new BadRequestException(
                    "Order discount type is required."
            );
        }

        if (request.getDiscountType() ==
                SaleOrderDiscountType.PERCENTAGE &&
                orderDiscountValue.compareTo(HUNDRED) > 0) {

            throw new BadRequestException(
                    "Order discount percentage cannot exceed 100."
            );
        }
    }

    private void validateDeliveryDate(
            LocalDate orderDate,
            LocalDate expectedDeliveryDate
    ) {

        if (expectedDeliveryDate != null &&
                expectedDeliveryDate.isBefore(orderDate)) {

            throw new BadRequestException(
                    "Expected delivery date cannot be before order date."
            );
        }
    }

    // =====================================================
    // CALCULATE PERCENTAGE
    // =====================================================

    private BigDecimal calculatePercentage(
            BigDecimal amount,
            BigDecimal percentage
    ) {

        if (amount == null ||
                percentage == null ||
                amount.signum() == 0 ||
                percentage.signum() == 0) {

            return BigDecimal.ZERO.setScale(MONEY_SCALE);
        }

        return amount
                .multiply(percentage)
                .divide(
                        HUNDRED,
                        MONEY_SCALE,
                        RoundingMode.HALF_UP
                );
    }

    // =====================================================
    // MONEY SCALE
    // =====================================================

    private BigDecimal money(BigDecimal value) {

        return zeroIfNull(value)
                .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }

    // =====================================================
    // NULL TO ZERO
    // =====================================================

    private BigDecimal zeroIfNull(BigDecimal value) {

        return value != null
                ? value
                : BigDecimal.ZERO;
    }

    // =====================================================
    // SALES ORDER NUMBER
    // =====================================================

    private String generateSalesOrderNumber() {

        String orderNo;

        do {

            orderNo = "SO-" +
                    Year.now().getValue() +
                    "-" +
                    UUID.randomUUID()
                            .toString()
                            .substring(0, 8)
                            .toUpperCase();

        } while (
                salesOrderRepository.existsByOrderNoIgnoreCase(orderNo)
        );

        return orderNo;
    }

    // =====================================================
    // PAYMENT ALLOCATION
    // Payment records remain separate from SalesOrderEntity.
    // =====================================================

    @Override
    public void allocatePayment(PaymentEntity payment) {

        validateSaleOrderPayment(payment);

        SalesOrderEntity salesOrder =
                salesOrderRepository.findActiveByIdForUpdate(
                        payment.getReferenceId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Sales order not found with ID: "
                                        + payment.getReferenceId()
                        )
                );

        if (salesOrder.getSalesOrderStatus() ==
                SaleOrderStatus.CANCELLED) {

            throw new BadRequestException(
                    "Cannot allocate payment to a cancelled sales order."
            );
        }

        // Payment is recorded separately.
        // Do not update payment balances on SalesOrderEntity.
    }

    @Override
    public void reversePayment(PaymentEntity payment) {

        validateSaleOrderPayment(payment);

        salesOrderRepository.findActiveByIdForUpdate(
                payment.getReferenceId()
        ).orElseThrow(() ->
                new ResourceNotFoundException(
                        "Sales order not found with ID: "
                                + payment.getReferenceId()
                )
        );

        // Reverse the separate payment allocation/accounting record
        // through the payment module.
        // Do not update SalesOrderEntity payment balances.
    }

    private void validateSaleOrderPayment(PaymentEntity payment) {

        if (payment == null) {
            throw new BadRequestException(
                    "Payment is required."
            );
        }

        if (payment.getReferenceType() !=
                PaymentReferenceType.SALE_ORDER) {

            throw new BadRequestException(
                    "Payment reference must be SALE_ORDER."
            );
        }

        if (payment.getReferenceId() == null) {
            throw new BadRequestException(
                    "Sales order reference ID is required."
            );
        }

        if (payment.getDirection() != PaymentDirection.RECEIVED) {
            throw new BadRequestException(
                    "Sales order payment direction must be RECEIVED."
            );
        }

        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new BadRequestException(
                    "Only completed payments can be allocated."
            );
        }
    }

    // =====================================================
    // PAGE RESPONSE
    // =====================================================

    private PageResponse<SalesOrderResponse> toPageResponse(
            Page<SalesOrderEntity> salesOrders
    ) {

        List<SalesOrderResponse> content =
                salesOrders.getContent()
                        .stream()
                        .map(saleOrderMapper::toResponse)
                        .toList();

        return PageResponse
                .<SalesOrderResponse>builder()
                .content(content)
                .pageNumber(salesOrders.getNumber())
                .pageSize(salesOrders.getSize())
                .totalElements(salesOrders.getTotalElements())
                .totalPages(salesOrders.getTotalPages())
                .last(salesOrders.isLast())
                .build();
    }
}
