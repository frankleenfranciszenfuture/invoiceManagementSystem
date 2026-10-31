package com.ims.service.serviceInterface.purchaseOrder;


import com.ims.entity.PurchaseOrderEntity;
import com.ims.entity.PurchaseOrderItemEntity;
import com.ims.entity.TaxMasterEntity;
import com.ims.enums.PurchaseOrderDiscountType;
import com.ims.enums.PurchaseOrderTaxType;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@Transactional
public class PurchaseOrderCalculationService {

    private static final int MONEY_SCALE = 2;
    private static final int PRICE_SCALE = 4;
    private static final int CALCULATION_SCALE = 8;

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

    /**
     * exchangeRate convention:
     * 1 selected currency unit = exchangeRate INR.
     *
     * baseUnitPrice = INR
     * unitPrice = selected currency
     */
    public void calculate(
            PurchaseOrderEntity order,
            PurchaseOrderTaxType taxType
    ) {

        if (order == null) {
            throw new IllegalArgumentException("Purchase Order is required.");
        }

        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new IllegalArgumentException(
                    "At least one Purchase Order item is required."
            );
        }

        BigDecimal exchangeRate = requirePositive(
                order.getExchangeRate(),
                "Exchange rate must be greater than zero."
        );

        List<PurchaseOrderItemEntity> items = order.getItems();

        BigDecimal subtotal = ZERO;
        BigDecimal baseSubtotal = ZERO;

        BigDecimal itemDiscountTotal = ZERO;
        BigDecimal baseItemDiscountTotal = ZERO;

        // First pass: calculate item prices and item-level discounts.
        for (PurchaseOrderItemEntity item : items) {

            // IMPORTANT: Copy GST rates from TaxMasterEntity.
            applyTaxMasterSnapshot(
                    item,
                    item.getTaxMaster(),
                    taxType
            );

            calculateItemGross(item, exchangeRate);

            BigDecimal itemDiscount = calculateDiscount(
                    item.getDiscountType(),
                    item.getDiscountValue(),
                    item.getLineAmount()
            );

            BigDecimal baseItemDiscount = money(
                    itemDiscount.multiply(exchangeRate)
            );

            item.setDiscountAmount(money(itemDiscount));
            item.setBaseDiscountAmount(money(baseItemDiscount));

            subtotal = subtotal.add(item.getLineAmount());
            baseSubtotal = baseSubtotal.add(item.getBaseLineAmount());

            itemDiscountTotal = itemDiscountTotal.add(itemDiscount);
            baseItemDiscountTotal =
                    baseItemDiscountTotal.add(baseItemDiscount);
        }

        subtotal = money(subtotal);
        baseSubtotal = money(baseSubtotal);

        itemDiscountTotal = money(itemDiscountTotal);
        baseItemDiscountTotal = money(baseItemDiscountTotal);

        BigDecimal subtotalAfterItemDiscount =
                money(subtotal.subtract(itemDiscountTotal));

        BigDecimal baseSubtotalAfterItemDiscount =
                money(baseSubtotal.subtract(baseItemDiscountTotal));

        // Calculate order-level discount on the remaining subtotal.
        BigDecimal orderDiscount = calculateDiscount(
                order.getDiscountType(),
                order.getDiscountValue(),
                subtotalAfterItemDiscount
        );

        BigDecimal baseOrderDiscount =
                money(orderDiscount.multiply(exchangeRate));

        BigDecimal totalDiscount =
                money(itemDiscountTotal.add(orderDiscount));

        BigDecimal baseTotalDiscount =
                money(baseItemDiscountTotal.add(baseOrderDiscount));

        // Allocate order-level discount proportionally to each item.
        allocateOrderDiscount(
                items,
                orderDiscount,
                baseOrderDiscount,
                subtotalAfterItemDiscount,
                baseSubtotalAfterItemDiscount
        );

        BigDecimal taxableAmount = ZERO;
        BigDecimal baseTaxableAmount = ZERO;

        BigDecimal cgstAmount = ZERO;
        BigDecimal sgstAmount = ZERO;
        BigDecimal igstAmount = ZERO;

        BigDecimal baseCgstAmount = ZERO;
        BigDecimal baseSgstAmount = ZERO;
        BigDecimal baseIgstAmount = ZERO;

        // Second pass: calculate taxable values and GST.
        for (PurchaseOrderItemEntity item : items) {

            BigDecimal itemTaxable = money(
                    item.getLineAmount().subtract(item.getDiscountAmount())
            );

            BigDecimal baseItemTaxable = money(
                    item.getBaseLineAmount().subtract(
                            item.getBaseDiscountAmount()
                    )
            );

            item.setTaxableAmount(itemTaxable);
            item.setBaseTaxableAmount(baseItemTaxable);

            applyTax(item, taxType);

            taxableAmount = taxableAmount.add(itemTaxable);
            baseTaxableAmount = baseTaxableAmount.add(baseItemTaxable);

            cgstAmount = cgstAmount.add(item.getCgstAmount());
            sgstAmount = sgstAmount.add(item.getSgstAmount());
            igstAmount = igstAmount.add(item.getIgstAmount());

            baseCgstAmount = baseCgstAmount.add(
                    item.getCgstAmount().multiply(exchangeRate)
            );

            baseSgstAmount = baseSgstAmount.add(
                    item.getSgstAmount().multiply(exchangeRate)
            );

            baseIgstAmount = baseIgstAmount.add(
                    item.getIgstAmount().multiply(exchangeRate)
            );

            item.setTotalTaxAmount(
                    money(
                            item.getCgstAmount()
                                    .add(item.getSgstAmount())
                                    .add(item.getIgstAmount())
                    )
            );

            item.setBaseTotalTaxAmount(
                    money(
                            item.getTotalTaxAmount().multiply(exchangeRate)
                    )
            );

            item.setTotalAmount(
                    money(
                            item.getTaxableAmount()
                                    .add(item.getTotalTaxAmount())
                    )
            );

            item.setBaseTotalAmount(
                    money(
                            item.getBaseTaxableAmount()
                                    .add(item.getBaseTotalTaxAmount())
                    )
            );
        }

        taxableAmount = money(taxableAmount);
        baseTaxableAmount = money(baseTaxableAmount);

        cgstAmount = money(cgstAmount);
        sgstAmount = money(sgstAmount);
        igstAmount = money(igstAmount);

        baseCgstAmount = money(baseCgstAmount);
        baseSgstAmount = money(baseSgstAmount);
        baseIgstAmount = money(baseIgstAmount);

        BigDecimal totalTaxAmount = money(
                cgstAmount.add(sgstAmount).add(igstAmount)
        );

        BigDecimal baseTotalTaxAmount = money(
                baseCgstAmount.add(baseSgstAmount).add(baseIgstAmount)
        );

        BigDecimal grandTotal = money(
                taxableAmount.add(totalTaxAmount)
        );

        BigDecimal baseGrandTotal = money(
                baseTaxableAmount.add(baseTotalTaxAmount)
        );

        // Store selected-currency totals.
        order.setSubtotal(subtotal);
        order.setDiscountAmount(totalDiscount);
        order.setTaxableAmount(taxableAmount);

        order.setCgstAmount(cgstAmount);
        order.setSgstAmount(sgstAmount);
        order.setIgstAmount(igstAmount);

        order.setTotalTaxAmount(totalTaxAmount);
        order.setGrandTotal(grandTotal);

        // Store INR totals.
        order.setBaseSubtotal(baseSubtotal);
        order.setBaseDiscountAmount(baseTotalDiscount);
        order.setBaseTaxableAmount(baseTaxableAmount);
        order.setBaseTotalTaxAmount(baseTotalTaxAmount);
        order.setBaseGrandTotal(baseGrandTotal);
    }

    private void calculateItemGross(
            PurchaseOrderItemEntity item,
            BigDecimal exchangeRate
    ) {

        BigDecimal quantity = requireNonNegative(
                item.getQuantity(),
                "Item quantity is required."
        );

        if (quantity.compareTo(ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Item quantity must be greater than zero."
            );
        }

        BigDecimal baseUnitPrice = requireNonNegative(
                item.getBaseUnitPrice(),
                "Base unit price in INR is required."
        );

        BigDecimal unitPrice = baseUnitPrice.divide(
                exchangeRate,
                PRICE_SCALE,
                RoundingMode.HALF_UP
        );

        BigDecimal baseLineAmount = money(
                quantity.multiply(baseUnitPrice)
        );

        BigDecimal lineAmount = money(
                quantity.multiply(unitPrice)
        );

        item.setUnitPrice(unitPrice);
        item.setBaseLineAmount(baseLineAmount);
        item.setLineAmount(lineAmount);
    }

    private void allocateOrderDiscount(
            List<PurchaseOrderItemEntity> items,
            BigDecimal orderDiscount,
            BigDecimal baseOrderDiscount,
            BigDecimal selectedSubtotalAfterItemDiscount,
            BigDecimal baseSubtotalAfterItemDiscount
    ) {

        BigDecimal allocatedDiscount = ZERO;
        BigDecimal allocatedBaseDiscount = ZERO;

        for (int index = 0; index < items.size(); index++) {

            PurchaseOrderItemEntity item = items.get(index);

            BigDecimal itemBase = money(
                    item.getLineAmount().subtract(item.getDiscountAmount())
            );

            BigDecimal itemBaseINR = money(
                    item.getBaseLineAmount().subtract(
                            item.getBaseDiscountAmount()
                    )
            );

            BigDecimal selectedAllocation;
            BigDecimal baseAllocation;

            if (index == items.size() - 1) {

                // Final item absorbs rounding differences.
                selectedAllocation = money(
                        orderDiscount.subtract(allocatedDiscount)
                );

                baseAllocation = money(
                        baseOrderDiscount.subtract(allocatedBaseDiscount)
                );

            } else if (selectedSubtotalAfterItemDiscount.compareTo(ZERO) > 0) {

                selectedAllocation = money(
                        orderDiscount.multiply(itemBase)
                                .divide(
                                        selectedSubtotalAfterItemDiscount,
                                        CALCULATION_SCALE,
                                        RoundingMode.HALF_UP
                                )
                );

                baseAllocation = money(
                        baseOrderDiscount.multiply(itemBaseINR)
                                .divide(
                                        baseSubtotalAfterItemDiscount,
                                        CALCULATION_SCALE,
                                        RoundingMode.HALF_UP
                                )
                );

            } else {

                selectedAllocation = ZERO;
                baseAllocation = ZERO;
            }

            allocatedDiscount = allocatedDiscount.add(selectedAllocation);
            allocatedBaseDiscount =
                    allocatedBaseDiscount.add(baseAllocation);

            item.setDiscountAmount(
                    money(item.getDiscountAmount().add(selectedAllocation))
            );

            item.setBaseDiscountAmount(
                    money(
                            item.getBaseDiscountAmount().add(baseAllocation)
                    )
            );
        }
    }

    private void applyTax(
            PurchaseOrderItemEntity item,
            PurchaseOrderTaxType taxType
    ) {

        BigDecimal taxable = item.getTaxableAmount();

        BigDecimal cgstRate = ZERO;
        BigDecimal sgstRate = ZERO;
        BigDecimal igstRate = ZERO;

        if (taxType == PurchaseOrderTaxType.CGST_SGST) {

            cgstRate = safe(item.getCgstRate());
            sgstRate = safe(item.getSgstRate());

        } else if (taxType == PurchaseOrderTaxType.IGST) {

            igstRate = safe(item.getIgstRate());

        } else {

            throw new IllegalArgumentException(
                    "Purchase Order tax type is required."
            );
        }

        BigDecimal cgst = percentage(taxable, cgstRate);
        BigDecimal sgst = percentage(taxable, sgstRate);
        BigDecimal igst = percentage(taxable, igstRate);

        item.setTaxType(taxType);
        item.setCgstAmount(cgst);
        item.setSgstAmount(sgst);
        item.setIgstAmount(igst);
    }

    /**
     * Copies the tax master rate snapshot to the Purchase Order item.
     *
     * Adjust the TaxMaster getters here if your TaxMasterEntity uses
     * different property names.
     */
    public void applyTaxMasterSnapshot(
            PurchaseOrderItemEntity item,
            TaxMasterEntity taxMaster,
            PurchaseOrderTaxType taxType
    ) {

        if (item == null) {
            throw new IllegalArgumentException("Purchase Order item is required.");
        }

        if (taxMaster == null) {
            item.setTaxMaster(null);
            item.setTaxRate(ZERO);
            item.setCgstRate(ZERO);
            item.setSgstRate(ZERO);
            item.setIgstRate(ZERO);
            item.setTaxType(taxType);
            return;
        }

        BigDecimal totalRate = safe(taxMaster.getTaxRate());
        BigDecimal cgstRate = safe(taxMaster.getCgstRate());
        BigDecimal sgstRate = safe(taxMaster.getSgstRate());
        BigDecimal igstRate = safe(taxMaster.getIgstRate());

        validateRate(totalRate, "Total tax rate");
        validateRate(cgstRate, "CGST rate");
        validateRate(sgstRate, "SGST rate");
        validateRate(igstRate, "IGST rate");

        if (taxType == PurchaseOrderTaxType.CGST_SGST) {

            if (cgstRate.add(sgstRate).compareTo(totalRate) != 0) {
                throw new IllegalArgumentException(
                        "CGST and SGST rates must equal the total tax rate."
                );
            }

        } else if (taxType == PurchaseOrderTaxType.IGST) {

            if (igstRate.compareTo(totalRate) != 0) {
                throw new IllegalArgumentException(
                        "IGST rate must equal the total tax rate."
                );
            }

        } else {

            throw new IllegalArgumentException(
                    "Purchase Order tax type is required."
            );
        }

        item.setTaxMaster(taxMaster);
        item.setTaxType(taxType);
        item.setTaxRate(totalRate);
        item.setCgstRate(cgstRate);
        item.setSgstRate(sgstRate);
        item.setIgstRate(igstRate);
    }

    private BigDecimal calculateDiscount(
            PurchaseOrderDiscountType type,
            BigDecimal value,
            BigDecimal amount
    ) {

        BigDecimal discountValue = safe(value);
        BigDecimal grossAmount = safe(amount);

        if (discountValue.compareTo(ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Discount cannot be negative."
            );
        }

        if (discountValue.compareTo(ZERO) == 0) {
            return ZERO;
        }

        if (type == null) {
            throw new IllegalArgumentException(
                    "Discount type is required."
            );
        }

        BigDecimal discount;

        if (type == PurchaseOrderDiscountType.PERCENTAGE) {

            if (discountValue.compareTo(ONE_HUNDRED) > 0) {
                throw new IllegalArgumentException(
                        "Discount percentage cannot exceed 100."
                );
            }

            discount = grossAmount.multiply(discountValue)
                    .divide(
                            ONE_HUNDRED,
                            CALCULATION_SCALE,
                            RoundingMode.HALF_UP
                    );

        } else if (type == PurchaseOrderDiscountType.AMOUNT) {

            discount = discountValue;

        } else {

            throw new IllegalArgumentException("Invalid discount type.");
        }

        if (discount.compareTo(grossAmount) > 0) {
            throw new IllegalArgumentException(
                    "Discount cannot exceed the item or order amount."
            );
        }

        return money(discount);
    }

    private BigDecimal percentage(
            BigDecimal amount,
            BigDecimal rate
    ) {

        validateRate(rate, "Tax rate");

        return money(
                amount.multiply(rate)
                        .divide(
                                ONE_HUNDRED,
                                CALCULATION_SCALE,
                                RoundingMode.HALF_UP
                        )
        );
    }

    private void validateRate(BigDecimal rate, String label) {

        if (rate.compareTo(ZERO) < 0
                || rate.compareTo(ONE_HUNDRED) > 0) {
            throw new IllegalArgumentException(
                    label + " must be between 0 and 100."
            );
        }
    }

    private BigDecimal requirePositive(
            BigDecimal value,
            String message
    ) {

        if (value == null || value.compareTo(ZERO) <= 0) {
            throw new IllegalArgumentException(message);
        }

        return value;
    }

    private BigDecimal requireNonNegative(
            BigDecimal value,
            String message
    ) {

        if (value == null || value.compareTo(ZERO) < 0) {
            throw new IllegalArgumentException(message);
        }

        return value;
    }

    private BigDecimal safe(BigDecimal value) {
        return value == null ? ZERO : value;
    }

    private BigDecimal money(BigDecimal value) {
        return safe(value).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }
}
