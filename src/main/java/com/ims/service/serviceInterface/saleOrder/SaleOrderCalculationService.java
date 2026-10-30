
package com.ims.service.serviceInterface.saleOrder;

import com.ims.entity.SalesOrderEntity;
import com.ims.entity.SalesOrderItemEntity;
import com.ims.entity.TaxMasterEntity;

import com.ims.enums.SaleOrderDiscountType;
import com.ims.enums.SaleOrderTaxType;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;


@Component
public class SaleOrderCalculationService {

    private static final int MONEY_SCALE = 2;
    private static final int PRICE_SCALE = 4;
    private static final int CALCULATION_SCALE = 8;

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final BigDecimal ONE_HUNDRED =
            new BigDecimal("100");


    // =========================================================
    // MAIN CALCULATION
    // =========================================================

    /**
     * Calculates all item and order totals.
     *
     * exchangeRate = INR per one unit of selected currency.
     *
     * Example:
     * USD -> INR = 83.50
     * INR -> INR = 1.00
     *
     * GST:
     * CGST_SGST = Intra-state
     * IGST = Inter-state
     */
    public void calculate(
            SalesOrderEntity order,
            SaleOrderTaxType taxType
    ) {

        if (order == null) {
            throw new IllegalArgumentException("Sale order is required");
        }

        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new IllegalArgumentException(
                    "Sale order must contain at least one item"
            );
        }

        BigDecimal exchangeRate = requirePositive(
                order.getExchangeRate(),
                "Exchange rate"
        );

        // 1. Calculate item amounts and item discounts.
        for (SalesOrderItemEntity item : order.getItems()) {

            if (item == null) {
                throw new IllegalArgumentException(
                        "Sale order item cannot be null"
                );
            }

            calculateItemBeforeOrderDiscount(item, exchangeRate);
        }

        // 2. Calculate subtotal and net amount after item discounts.
        BigDecimal subtotal = ZERO;
        BigDecimal baseSubtotal = ZERO;
        BigDecimal netBeforeOrderDiscount = ZERO;
        BigDecimal totalItemDiscount = ZERO;
        BigDecimal baseItemDiscount = ZERO;

        for (SalesOrderItemEntity item : order.getItems()) {

            subtotal = subtotal.add(item.getLineAmount());
            baseSubtotal = baseSubtotal.add(item.getBaseLineAmount());

            totalItemDiscount = totalItemDiscount.add(
                    item.getDiscountAmount()
            );

            baseItemDiscount = baseItemDiscount.add(
                    item.getBaseDiscountAmount()
            );

            netBeforeOrderDiscount = netBeforeOrderDiscount.add(
                    item.getLineAmount().subtract(item.getDiscountAmount())
            );
        }

        subtotal = money(subtotal);
        baseSubtotal = money(baseSubtotal);
        netBeforeOrderDiscount = money(netBeforeOrderDiscount);

        // 3. Calculate order-level discount.
        BigDecimal orderDiscount = calculateDiscount(
                order.getDiscountType(),
                zeroIfNull(order.getDiscountValue()),
                netBeforeOrderDiscount
        );

        // 4. Allocate order discount to individual items.
        allocateOrderDiscount(
                order.getItems(),
                orderDiscount,
                netBeforeOrderDiscount
        );

        // 5. Calculate final item discount amounts in base currency.
        BigDecimal totalDiscount = ZERO;
        BigDecimal baseTotalDiscount = ZERO;

        for (SalesOrderItemEntity item : order.getItems()) {

            item.setBaseDiscountAmount(
                    money(item.getDiscountAmount().multiply(exchangeRate))
            );

            totalDiscount = totalDiscount.add(
                    item.getDiscountAmount()
            );

            baseTotalDiscount = baseTotalDiscount.add(
                    item.getBaseDiscountAmount()
            );
        }

        // 6. Calculate GST and final totals.
        BigDecimal totalTax = ZERO;
        BigDecimal totalBaseTax = ZERO;

        BigDecimal totalCgst = ZERO;
        BigDecimal totalSgst = ZERO;
        BigDecimal totalIgst = ZERO;

        BigDecimal totalTaxable = ZERO;
        BigDecimal totalBaseTaxable = ZERO;

        BigDecimal grandTotal = ZERO;
        BigDecimal baseGrandTotal = ZERO;

        for (SalesOrderItemEntity item : order.getItems()) {

            calculateItemTax(
                    item,
                    exchangeRate,
                    taxType
            );

            totalTaxable = totalTaxable.add(
                    item.getTaxableAmount()
            );

            totalBaseTaxable = totalBaseTaxable.add(
                    item.getBaseTaxableAmount()
            );

            totalCgst = totalCgst.add(item.getCgstAmount());
            totalSgst = totalSgst.add(item.getSgstAmount());
            totalIgst = totalIgst.add(item.getIgstAmount());

            totalTax = totalTax.add(item.getTotalTaxAmount());

            totalBaseTax = totalBaseTax.add(
                    item.getBaseTotalTaxAmount()
            );

            grandTotal = grandTotal.add(item.getTotalAmount());

            baseGrandTotal = baseGrandTotal.add(
                    item.getBaseTotalAmount()
            );
        }

        // 7. Set order financial summary.
        order.setSubtotal(subtotal);
        order.setBaseSubtotal(baseSubtotal);

        order.setDiscountAmount(money(totalDiscount));
        order.setBaseDiscountAmount(money(baseTotalDiscount));

        order.setTaxableAmount(money(totalTaxable));
        order.setBaseTaxableAmount(money(totalBaseTaxable));

        order.setCgstAmount(money(totalCgst));
        order.setSgstAmount(money(totalSgst));
        order.setIgstAmount(money(totalIgst));

        order.setTotalTaxAmount(money(totalTax));
        order.setBaseTotalTaxAmount(money(totalBaseTax));

        order.setGrandTotal(money(grandTotal));
        order.setBaseGrandTotal(money(baseGrandTotal));
    }


    // =========================================================
    // ITEM CALCULATION
    // =========================================================

    private void calculateItemBeforeOrderDiscount(
            SalesOrderItemEntity item,
            BigDecimal exchangeRate
    ) {

        BigDecimal quantity = requirePositive(
                item.getQuantity(),
                "Item quantity"
        );

        BigDecimal baseUnitPrice = requireNonNegative(
                item.getBaseUnitPrice(),
                "Base unit price"
        );

        /*
         * Base unit price is INR.
         *
         * Selected currency unit price =
         * INR / INR-per-currency exchange rate.
         */
        BigDecimal calculatedUnitPrice = baseUnitPrice.divide(
                exchangeRate,
                PRICE_SCALE,
                RoundingMode.HALF_UP
        );

        item.setUnitPrice(calculatedUnitPrice);

        BigDecimal lineAmount = money(
                quantity.multiply(calculatedUnitPrice)
        );

        BigDecimal baseLineAmount = money(
                quantity.multiply(baseUnitPrice)
        );

        BigDecimal itemDiscount = calculateDiscount(
                item.getDiscountType(),
                zeroIfNull(item.getDiscountValue()),
                lineAmount
        );

        if (itemDiscount.compareTo(lineAmount) > 0) {
            throw new IllegalArgumentException(
                    "Item discount cannot exceed line amount"
            );
        }

        BigDecimal baseDiscount = money(
                itemDiscount.multiply(exchangeRate)
        );

        item.setLineAmount(lineAmount);
        item.setBaseLineAmount(baseLineAmount);

        item.setDiscountAmount(itemDiscount);
        item.setBaseDiscountAmount(baseDiscount);
    }


    // =========================================================
    // ORDER DISCOUNT ALLOCATION
    // =========================================================

    private void allocateOrderDiscount(
            List<SalesOrderItemEntity> items,
            BigDecimal orderDiscount,
            BigDecimal netAmount
    ) {

        if (orderDiscount.signum() == 0 || netAmount.signum() == 0) {
            return;
        }

        List<SalesOrderItemEntity> eligibleItems = items.stream()
                .filter(item ->
                        item.getLineAmount()
                                .subtract(item.getDiscountAmount())
                                .signum() > 0
                )
                .toList();

        if (eligibleItems.isEmpty()) {
            throw new IllegalArgumentException(
                    "No eligible items available for order discount"
            );
        }

        BigDecimal allocated = ZERO;

        for (int i = 0; i < eligibleItems.size(); i++) {

            SalesOrderItemEntity item = eligibleItems.get(i);

            BigDecimal itemNet = money(
                    item.getLineAmount().subtract(item.getDiscountAmount())
            );

            BigDecimal remaining = money(
                    orderDiscount.subtract(allocated)
            );

            BigDecimal allocation;

            if (i == eligibleItems.size() - 1) {

                allocation = remaining;

            } else {

                allocation = money(
                        orderDiscount.multiply(itemNet)
                                .divide(
                                        netAmount,
                                        CALCULATION_SCALE,
                                        RoundingMode.HALF_UP
                                )
                );

                allocation = allocation.min(remaining);
                allocation = allocation.min(itemNet);

                allocated = allocated.add(allocation);
            }

            if (allocation.signum() < 0 || allocation.compareTo(itemNet) > 0) {
                throw new IllegalArgumentException(
                        "Allocated order discount exceeds item amount"
                );
            }

            item.setDiscountAmount(
                    money(item.getDiscountAmount().add(allocation))
            );
        }
    }


    // =========================================================
    // GST CALCULATION
    // =========================================================

    private void calculateItemTax(
            SalesOrderItemEntity item,
            BigDecimal exchangeRate,
            SaleOrderTaxType taxType
    ) {

        BigDecimal taxableAmount = money(
                item.getLineAmount()
                        .subtract(item.getDiscountAmount())
        );

        if (taxableAmount.signum() < 0) {
            throw new IllegalArgumentException(
                    "Taxable amount cannot be negative"
            );
        }

        BigDecimal baseTaxableAmount = money(
                taxableAmount.multiply(exchangeRate)
        );

        BigDecimal cgstRate = zeroIfNull(
                item.getCgstRate()
        );

        BigDecimal sgstRate = zeroIfNull(
                item.getSgstRate()
        );

        BigDecimal igstRate = zeroIfNull(
                item.getIgstRate()
        );

        BigDecimal taxRate = zeroIfNull(
                item.getTaxRate()
        );

        validateTaxRate(cgstRate, "CGST rate");
        validateTaxRate(sgstRate, "SGST rate");
        validateTaxRate(igstRate, "IGST rate");
        validateTaxRate(taxRate, "Tax rate");

        BigDecimal cgst = ZERO;
        BigDecimal sgst = ZERO;
        BigDecimal igst = ZERO;

        if (item.getTaxMaster() != null) {

            if (taxType == null) {
                throw new IllegalArgumentException(
                        "Sale tax type must be determined before calculating GST"
                );
            }

            if (taxType == SaleOrderTaxType.CGST_SGST) {

                cgst = percentage(
                        taxableAmount,
                        cgstRate
                );

                sgst = percentage(
                        taxableAmount,
                        sgstRate
                );

            } else if (taxType == SaleOrderTaxType.IGST) {

                igst = percentage(
                        taxableAmount,
                        igstRate.signum() > 0
                                ? igstRate
                                : taxRate
                );
            }
        }

        cgst = money(cgst);
        sgst = money(sgst);
        igst = money(igst);

        BigDecimal totalTax = money(
                cgst.add(sgst).add(igst)
        );

        BigDecimal baseTotalTax = money(
                totalTax.multiply(exchangeRate)
        );

        BigDecimal totalAmount = money(
                taxableAmount.add(totalTax)
        );

        BigDecimal baseTotalAmount = money(
                totalAmount.multiply(exchangeRate)
        );

        item.setTaxType(taxType);

        item.setTaxableAmount(taxableAmount);
        item.setBaseTaxableAmount(baseTaxableAmount);

        item.setCgstAmount(cgst);
        item.setSgstAmount(sgst);
        item.setIgstAmount(igst);

        item.setTotalTaxAmount(totalTax);
        item.setBaseTotalTaxAmount(baseTotalTax);

        item.setTotalAmount(totalAmount);
        item.setBaseTotalAmount(baseTotalAmount);
    }


    // =========================================================
    // TAX MASTER SNAPSHOT
    // =========================================================

    public void applyTaxMasterSnapshot(
            SalesOrderItemEntity item,
            TaxMasterEntity taxMaster
    ) {

        if (item == null) {
            throw new IllegalArgumentException(
                    "Sale order item is required"
            );
        }

        item.setTaxMaster(taxMaster);

        if (taxMaster == null) {

            item.setTaxRate(ZERO);
            item.setCgstRate(ZERO);
            item.setSgstRate(ZERO);
            item.setIgstRate(ZERO);

            return;
        }

        item.setTaxRate(
                zeroIfNull(taxMaster.getTaxRate())
        );

        item.setCgstRate(
                zeroIfNull(taxMaster.getCgstRate())
        );

        item.setSgstRate(
                zeroIfNull(taxMaster.getSgstRate())
        );

        item.setIgstRate(
                zeroIfNull(taxMaster.getIgstRate())
        );
    }


    // =========================================================
    // DISCOUNT CALCULATION
    // =========================================================

    private BigDecimal calculateDiscount(
            SaleOrderDiscountType type,
            BigDecimal value,
            BigDecimal amount
    ) {

        if (value == null) {
            value = ZERO;
        }

        if (value.signum() < 0) {
            throw new IllegalArgumentException(
                    "Discount cannot be negative"
            );
        }

        if (value.signum() == 0) {
            return ZERO;
        }

        if (type == null) {
            throw new IllegalArgumentException(
                    "Discount type is required when discount value is greater than zero"
            );
        }

        BigDecimal discount;

        if (type == SaleOrderDiscountType.PERCENTAGE) {

            if (value.compareTo(ONE_HUNDRED) > 0) {
                throw new IllegalArgumentException(
                        "Discount percentage cannot exceed 100"
                );
            }

            discount = amount.multiply(value)
                    .divide(
                            ONE_HUNDRED,
                            CALCULATION_SCALE,
                            RoundingMode.HALF_UP
                    );

        } else if (type == SaleOrderDiscountType.AMOUNT) {

            discount = value;

        } else {

            throw new IllegalArgumentException(
                    "Unsupported discount type"
            );
        }

        if (discount.compareTo(amount) > 0) {
            throw new IllegalArgumentException(
                    "Discount cannot exceed the item amount"
            );
        }

        return money(discount);
    }


    // =========================================================
    // VALIDATION HELPERS
    // =========================================================

    private void validateTaxRate(
            BigDecimal rate,
            String field
    ) {

        if (rate.signum() < 0
                || rate.compareTo(ONE_HUNDRED) > 0) {

            throw new IllegalArgumentException(
                    field + " must be between 0 and 100"
            );
        }
    }


    private BigDecimal percentage(
            BigDecimal amount,
            BigDecimal rate
    ) {

        return amount.multiply(rate)
                .divide(
                        ONE_HUNDRED,
                        CALCULATION_SCALE,
                        RoundingMode.HALF_UP
                );
    }


    private BigDecimal requirePositive(
            BigDecimal value,
            String field
    ) {

        if (value == null || value.signum() <= 0) {
            throw new IllegalArgumentException(
                    field + " must be greater than zero"
            );
        }

        return value;
    }


    private BigDecimal requireNonNegative(
            BigDecimal value,
            String field
    ) {

        if (value == null || value.signum() < 0) {
            throw new IllegalArgumentException(
                    field + " cannot be negative"
            );
        }

        return value;
    }


    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? ZERO : value;
    }


    private BigDecimal money(BigDecimal value) {

        return value.setScale(
                MONEY_SCALE,
                RoundingMode.HALF_UP
        );
    }
}
