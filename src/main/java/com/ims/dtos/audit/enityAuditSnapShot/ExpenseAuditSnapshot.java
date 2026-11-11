package com.ims.dtos.audit.enityAuditSnapShot;


import com.ims.enums.ExpensePaymentStatus;
import com.ims.enums.ExpenseStatus;
import com.ims.enums.ExpenseType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseAuditSnapshot {

    private Long id;

    private String expenseNo;

    private ExpenseType expenseType;

    // Expense Category
    private Long expenseCategoryId;
    private String categoryCode;
    private String categoryName;

    // Expense Information
    private LocalDate expenseDate;
    private String description;
    private String referenceNo;

    // Vendor
    private Long vendorId;
    private String vendorName;

    // Warehouse
    private Long warehouseId;

    // Currency
    private Long currencyId;
    private String currencyCode;
    private String currencyName;
    private String currencySymbol;
    private BigDecimal exchangeRate;

    // Tax Master
    private Long taxMasterId;
    private String taxName;

    // Selected Currency Amounts
    private BigDecimal amount;
    private BigDecimal discountAmount;
    private BigDecimal taxableAmount;

    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;

    private BigDecimal totalTaxAmount;
    private BigDecimal totalAmount;

    // Base Currency Amounts
    private BigDecimal baseAmount;
    private BigDecimal baseDiscountAmount;
    private BigDecimal baseTaxableAmount;

    private BigDecimal baseCgstAmount;
    private BigDecimal baseSgstAmount;
    private BigDecimal baseIgstAmount;

    private BigDecimal baseTotalTaxAmount;
    private BigDecimal baseTotalAmount;

    // Payment
    private BigDecimal paidAmount;
    private BigDecimal dueAmount;

    // Status
    private ExpenseStatus expenseStatus;
    private ExpensePaymentStatus paymentStatus;

    // Approval
    private Long approvedBy;
    private LocalDateTime approvedAt;

    // Rejection
    private Long rejectedBy;
    private LocalDateTime rejectedAt;
    private String rejectionReason;

    // Notes
    private String notes;

    private Boolean active;
}
