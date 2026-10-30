
package com.ims.utils.validation;

import com.ims.entity.*;
import com.ims.enums.SaleOrderDiscountType;
import com.ims.enums.SaleOrderPartyType;
import com.ims.exception.BadRequestException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.repository.*;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class SaleOrderValidation {

    private final CustomerRepository customerRepository;
    private final PartyRepository partyRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final UnitRepository unitRepository;
    private final SizeRepository sizeRepository;
    private final TaxMasterRepository taxMasterRepository;
    private final CurrencyRepository currencyRepository;
    // --------------------------------------------------
    // CUSTOMER / PARTY TYPE VALIDATION
    // --------------------------------------------------

    public void validatePartyType(
            SaleOrderPartyType partyType,
            Long customerId,
            Long partyId
    ) {

        if (partyType == null) {
            throw new IllegalArgumentException(
                    "Sale Order party type is required"
            );
        }

        if (partyType == SaleOrderPartyType.CUSTOMER) {

            if (customerId == null) {
                throw new IllegalArgumentException(
                        "Customer is required"
                );
            }

            if (partyId != null) {
                throw new IllegalArgumentException(
                        "Party ID is not allowed for CUSTOMER orders"
                );
            }
        }

        if (partyType == SaleOrderPartyType.PARTY) {

            if (partyId == null) {
                throw new IllegalArgumentException(
                        "Party is required"
                );
            }

            if (customerId != null) {
                throw new IllegalArgumentException(
                        "Customer ID is not allowed for PARTY orders"
                );
            }
        }
    }

    // --------------------------------------------------
    // CUSTOMER VALIDATION
    // --------------------------------------------------

    public CustomerEntity validateCustomer(Long customerId) {

        if (customerId == null) {
            throw new IllegalArgumentException(
                    "Customer is required"
            );
        }

        CustomerEntity customer = customerRepository
                .findById(customerId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Customer not found"
                        )
                );

        if (!Boolean.TRUE.equals(customer.getActive())) {
            throw new IllegalArgumentException(
                    "Selected customer is inactive"
            );
        }

        return customer;
    }

    // --------------------------------------------------
    // PARTY VALIDATION
    // --------------------------------------------------

    public PartyEntity validateParty(Long partyId) {

        if (partyId == null) {
            throw new IllegalArgumentException(
                    "Party is required"
            );
        }

        PartyEntity party = partyRepository
                .findByIdAndActiveTrue(partyId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Party not found or inactive"
                        )
                );

        return party;
    }

    // --------------------------------------------------
    // WAREHOUSE VALIDATION
    // --------------------------------------------------

    public WarehouseEntity validateWarehouse(Long warehouseId) {

        if (warehouseId == null) {
            throw new IllegalArgumentException(
                    "Warehouse is required"
            );
        }

        WarehouseEntity warehouse = warehouseRepository
                .findById(warehouseId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Warehouse not found"
                        )
                );

        if (!Boolean.TRUE.equals(warehouse.getActive())) {
            throw new IllegalArgumentException(
                    "Selected warehouse is inactive"
            );
        }

        return warehouse;
    }

    // --------------------------------------------------
    // PRODUCT VALIDATION
    // --------------------------------------------------

    public ProductEntity validateProduct(Long productId) {

        if (productId == null) {
            throw new BadRequestException("Product is required.");
        }

        return productRepository.findByIdAndActiveTrue(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with ID: " + productId
                ));
    }

    // --------------------------------------------------
    // UNIT VALIDATION
    // --------------------------------------------------

    public UnitEntity validateUnit(
            Long unitId,
            Long productId
    ) {

        if (unitId == null) {
            return null;
        }

        UnitEntity unit = unitRepository
                .findById(unitId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Unit not found"
                        )
                );

        if (!Boolean.TRUE.equals(unit.getActive())) {
            throw new IllegalArgumentException(
                    "Selected unit is inactive"
            );
        }

        if (unit.getProduct() == null
                || !productId.equals(unit.getProduct().getId())) {

            throw new IllegalArgumentException(
                    "Selected unit does not belong to this product"
            );
        }

        return unit;
    }

    // --------------------------------------------------
    // SIZE VALIDATION
    // --------------------------------------------------

    public SizeEntity validateSize(
            Long sizeId,
            Long productId
    ) {

        if (sizeId == null) {
            return null;
        }

        SizeEntity size = sizeRepository
                .findById(sizeId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Size not found"
                        )
                );

        if (!Boolean.TRUE.equals(size.getActive())) {
            throw new IllegalArgumentException(
                    "Selected size is inactive"
            );
        }

        if (size.getProduct() == null
                || !productId.equals(size.getProduct().getId())) {

            throw new IllegalArgumentException(
                    "Selected size does not belong to this product"
            );
        }

        return size;
    }

    // --------------------------------------------------
    // TAX MASTER VALIDATION
    // --------------------------------------------------

    public TaxMasterEntity validateTaxMaster(Long taxMasterId) {

        if (taxMasterId == null) {
            return null;
        }

        TaxMasterEntity taxMaster = taxMasterRepository
                .findById(taxMasterId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Tax master not found"
                        )
                );

        if (!Boolean.TRUE.equals(taxMaster.getActive())) {
            throw new IllegalArgumentException(
                    "Selected tax master is inactive"
            );
        }

        validateTaxRates(taxMaster);

        return taxMaster;
    }

    // --------------------------------------------------
    // CURRENCY VALIDATION
    // --------------------------------------------------

    public Currency validateCurrency(Long currencyId) {

        if (currencyId == null) {
            throw new IllegalArgumentException(
                    "Currency is required"
            );
        }

        Currency currency = currencyRepository
                .findById(currencyId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Currency not found: " + currencyId
                        )
                );

        if (!Boolean.TRUE.equals(currency.getActive())) {
            throw new IllegalArgumentException(
                    "Selected currency is inactive"
            );
        }

        return currency;
    }

    // --------------------------------------------------
    // DISCOUNT VALIDATION
    // --------------------------------------------------

    public void validateDiscount(
            SaleOrderDiscountType discountType,
            BigDecimal discountValue,
            BigDecimal amount,
            String fieldName
    ) {

        if (discountValue == null) {
            discountValue = BigDecimal.ZERO;
        }

        if (discountValue.signum() < 0) {
            throw new IllegalArgumentException(
                    fieldName + " cannot be negative"
            );
        }

        if (discountType == null) {

            if (discountValue.signum() > 0) {
                throw new IllegalArgumentException(
                        fieldName + " type is required"
                );
            }

            return;
        }

        if (discountType == SaleOrderDiscountType.PERCENTAGE) {

            if (discountValue.compareTo(
                    new BigDecimal("100")) > 0) {

                throw new IllegalArgumentException(
                        fieldName + " percentage cannot exceed 100"
                );
            }

            return;
        }

        if (discountType == SaleOrderDiscountType.AMOUNT) {

            if (amount == null) {
                throw new IllegalArgumentException(
                        "Amount is required to validate " + fieldName
                );
            }

            if (discountValue.compareTo(amount) > 0) {
                throw new IllegalArgumentException(
                        fieldName + " cannot exceed the item amount"
                );
            }

            return;
        }

        throw new IllegalArgumentException(
                "Invalid discount type: " + discountType
        );
    }

    // --------------------------------------------------
    // TAX RATE VALIDATION
    // --------------------------------------------------

    public void validateTaxRates(TaxMasterEntity taxMaster) {

        BigDecimal taxRate = zeroIfNull(taxMaster.getTaxRate());
        BigDecimal cgstRate = zeroIfNull(taxMaster.getCgstRate());
        BigDecimal sgstRate = zeroIfNull(taxMaster.getSgstRate());
        BigDecimal igstRate = zeroIfNull(taxMaster.getIgstRate());

        if (taxRate.signum() < 0
                || cgstRate.signum() < 0
                || sgstRate.signum() < 0
                || igstRate.signum() < 0) {

            throw new IllegalArgumentException(
                    "Tax rates cannot be negative"
            );
        }

        if (cgstRate.add(sgstRate).compareTo(taxRate) != 0
                && cgstRate.signum() > 0
                && sgstRate.signum() > 0) {

            throw new IllegalArgumentException(
                    "CGST and SGST rates must add up to the total tax rate"
            );
        }

        if (igstRate.signum() > 0
                && taxRate.signum() > 0
                && igstRate.compareTo(taxRate) != 0) {

            throw new IllegalArgumentException(
                    "IGST rate must match the total tax rate"
            );
        }
    }

    // --------------------------------------------------
    // DATE RANGE VALIDATION
    // --------------------------------------------------

    public void validateDateRange(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        if (fromDate != null
                && toDate != null
                && fromDate.isAfter(toDate)) {

            throw new IllegalArgumentException(
                    "From date cannot be after to date"
            );
        }
    }

    // --------------------------------------------------
    // COMMON
    // --------------------------------------------------

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
