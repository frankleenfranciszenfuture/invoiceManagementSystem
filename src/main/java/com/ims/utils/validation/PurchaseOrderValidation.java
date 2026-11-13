package com.ims.utils.validation;


import com.ims.dtos.purchaseOrder.PurchaseOrderItemRequest;
import com.ims.dtos.purchaseOrder.PurchaseOrderRequest;
import com.ims.entity.*;
import com.ims.enums.PartyType;
import com.ims.enums.PurchaseOrderDiscountType;
import com.ims.enums.PurchaseOrderPartyType;
import com.ims.enums.SaleOrderPartyType;
import com.ims.exception.BadRequestException;
import com.ims.repository.*;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PurchaseOrderValidation {

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

    private final PartyRepository partyRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final UnitRepository unitRepository;
    private final SizeRepository sizeRepository;
    private final TaxMasterRepository taxMasterRepository;
    private final CurrencyRepository currencyRepository;
    private final CustomerRepository customerRepository;

    public void validatePartyType(
            PurchaseOrderPartyType partyType,
            Long customerId,
            Long partyId
    ) {

        if (partyType == null) {
            throw new BadRequestException("Purchase Order party type is required.");
        }

        switch (partyType) {

            case CUSTOMER -> {
                if (customerId == null) {
                    throw new BadRequestException("Customer is required.");
                }

                if (partyId != null) {
                    throw new BadRequestException(
                            "Party ID is not allowed for CUSTOMER orders."
                    );
                }
            }

            case PARTY -> {
                if (partyId == null) {
                    throw new BadRequestException("Party is required.");
                }

                if (customerId != null) {
                    throw new BadRequestException(
                            "Customer ID is not allowed for PARTY orders."
                    );
                }
            }

            case BOTH -> {
                if (customerId == null) {
                    throw new BadRequestException(
                            "Customer is required for BOTH orders."
                    );
                }

                if (partyId == null) {
                    throw new BadRequestException(
                            "Party is required for BOTH orders."
                    );
                }
            }
        }
    }

    public CustomerEntity validateCustomer(Long customerId) {

        if (customerId == null) {
            throw new BadRequestException("Customer is required.");
        }

        return customerRepository.findByIdAndActiveTrue(customerId)
                .orElseThrow(() ->
                        new BadRequestException("Customer not found or inactive.")
                );
    }

    public PartyEntity validateParty(Long partyId) {

        if (partyId == null) {
            throw new BadRequestException("Party is required.");
        }

        return partyRepository.findByIdAndActiveTrue(partyId)
                .orElseThrow(() ->
                        new BadRequestException("Party not found or inactive.")
                );
    }

    public WarehouseEntity validateWarehouse(Long warehouseId) {

        if (warehouseId == null) {
            throw new IllegalArgumentException("Warehouse is required.");
        }

        return warehouseRepository.findByIdAndActiveTrue(warehouseId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Warehouse not found or inactive.")
                );
    }

    public Currency validateCurrency(Long currencyId) {

        if (currencyId == null) {
            throw new IllegalArgumentException("Currency is required.");
        }

        return currencyRepository.findByIdAndActiveTrue(currencyId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Currency not found or inactive.")
                );
    }

    public ProductEntity validateProduct(Long productId) {

        if (productId == null) {
            throw new BadRequestException("Product is required.");
        }

        return productRepository.findByIdAndActiveTrue(productId)
                .orElseThrow(() ->
                        new BadRequestException("Product not found or inactive.")
                );
    }

    public UnitEntity validateUnit(Long unitId, Long productId) {

        if (unitId == null) {
            throw new BadRequestException("Unit is required.");
        }

        UnitEntity unit = unitRepository.findByIdAndActiveTrue(unitId)
                .orElseThrow(() ->
                        new BadRequestException("Unit not found or inactive.")
                );

        if (unit.getProduct() == null
                || !unit.getProduct().getId().equals(productId)) {

            throw new BadRequestException(
                    "Selected unit does not belong to the selected product."
            );
        }

        return unit;
    }

    public SizeEntity validateSize(Long sizeId, Long productId) {

        if (sizeId == null) {
            return null;
        }

        SizeEntity size = sizeRepository.findByIdAndActiveTrue(sizeId)
                .orElseThrow(() ->
                        new BadRequestException("Size not found or inactive.")
                );

        if (size.getProduct() == null
                || !size.getProduct().getId().equals(productId)) {

            throw new BadRequestException(
                    "Selected size does not belong to the selected product."
            );
        }

        return size;
    }


    public TaxMasterEntity validateTaxMaster(Long taxMasterId) {

        if (taxMasterId == null) {
            return null;
        }

        return taxMasterRepository.findByIdAndActiveTrue(taxMasterId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Tax master not found or inactive.")
                );
    }

    public void validateRequest(PurchaseOrderRequest request) {

        if (request == null) {
            throw new BadRequestException(
                    "Purchase Order request is required."
            );
        }

        if (request.getCustomerId() != null) {
            validateCustomer(request.getCustomerId());
        }

        if (request.getPartyId() != null) {
            validateParty(request.getPartyId());
        }

        validatePartyType(
                request.getPartyType(),
                request.getCustomerId(),
                request.getPartyId()
        );

        validateWarehouse(request.getWarehouseId());

        validateCurrency(request.getCurrencyId());

        validateOrderDates(
                request.getOrderDate(),
                request.getExpectedDeliveryDate()
        );

        validateOrderDiscount(
                request.getDiscountType(),
                request.getDiscountValue()
        );

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException(
                    "At least one purchase order item is required."
            );
        }

        Set<String> itemKeys = new HashSet<>();

        for (PurchaseOrderItemRequest item : request.getItems()) {

            if (item == null) {
                throw new BadRequestException(
                        "Purchase Order item cannot be empty."
                );
            }

            validateItem(item);

            String key = item.getProductId()
                    + "-" + item.getUnitId()
                    + "-" + (item.getSizeId() == null ? "0" : item.getSizeId());

            if (!itemKeys.add(key)) {
                throw new BadRequestException(
                        "Duplicate product, unit and size combination found."
                );
            }
        }
    }

    public void validateItem(PurchaseOrderItemRequest item) {

        ProductEntity product = validateProduct(item.getProductId());

        validateUnit(item.getUnitId(), product.getId());
        validateSize(item.getSizeId(), product.getId());
        validateTaxMaster(item.getTaxMasterId());

        validateQuantity(item.getQuantity());
        validatePrice(item.getBaseUnitPrice());

        validateItemDiscount(
                item.getDiscountType(),
                item.getDiscountValue()
        );
    }

    public void validateOrderDates(
            LocalDate orderDate,
            LocalDate expectedDeliveryDate
    ) {

        if (orderDate == null) {
            throw new IllegalArgumentException("Order date is required.");
        }

        if (expectedDeliveryDate != null
                && expectedDeliveryDate.isBefore(orderDate)) {
            throw new IllegalArgumentException(
                    "Expected delivery date cannot be before order date."
            );
        }
    }

    public void validateQuantity(BigDecimal quantity) {

        if (quantity == null || quantity.compareTo(ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Item quantity must be greater than zero."
            );
        }
    }

    public void validatePrice(BigDecimal price) {

        if (price == null || price.compareTo(ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Base unit price in INR is required and cannot be negative."
            );
        }
    }

    public void validateOrderDiscount(
            PurchaseOrderDiscountType discountType,
            BigDecimal discountValue
    ) {
        validateDiscount(discountType, discountValue, "Order");
    }

    public void validateItemDiscount(
            PurchaseOrderDiscountType discountType,
            BigDecimal discountValue
    ) {
        validateDiscount(discountType, discountValue, "Item");
    }

    private void validateDiscount(
            PurchaseOrderDiscountType discountType,
            BigDecimal discountValue,
            String label
    ) {

        if (discountValue == null) {
            return;
        }

        if (discountValue.compareTo(ZERO) < 0) {
            throw new IllegalArgumentException(
                    label + " discount cannot be negative."
            );
        }

        if (discountType == null
                && discountValue.compareTo(ZERO) > 0) {
            throw new IllegalArgumentException(
                    label + " discount type is required."
            );
        }

        if (discountType == PurchaseOrderDiscountType.PERCENTAGE
                && discountValue.compareTo(ONE_HUNDRED) > 0) {
            throw new IllegalArgumentException(
                    label + " discount percentage cannot exceed 100."
            );
        }
    }
}