
package com.ims.dtos.expenses;

import com.ims.dtos.common.BaseResponse;
import com.ims.enums.ExpensePaymentStatus;
import com.ims.enums.ExpenseStatus;
import com.ims.enums.ExpenseType;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ExpenseResponseDTO extends BaseResponse {

    // =====================================================
    // BASIC DETAILS
    // =====================================================

    private Long id;
    private String expenseNo;
    private ExpenseType expenseType;


    // =====================================================
    // EXPENSE CATEGORY
    // =====================================================

    private Long expenseCategoryId;
    private String categoryCode;
    private String categoryName;


    // =====================================================
    // EXPENSE INFORMATION
    // =====================================================

    private LocalDate expenseDate;
    private String description;
    private String referenceNo;


    // =====================================================
    // VENDOR / SUPPLIER
    // =====================================================

    private Long vendorId;
    private String vendorName;


    // =====================================================
    // WAREHOUSE
    // =====================================================

    private Long warehouseId;


    // =====================================================
    // CURRENCY
    // =====================================================

    private Long currencyId;
    private String currencyCode;
    private String currencyName;
    private String currencySymbol;
    private BigDecimal exchangeRate;


    // =====================================================
    // TAX MASTER
    // =====================================================

    private Long taxMasterId;
    private String taxName;


    // =====================================================
    // SELECTED CURRENCY AMOUNTS
    // =====================================================

    private BigDecimal amount;
    private BigDecimal discountAmount;
    private BigDecimal taxableAmount;

    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;

    private BigDecimal totalTaxAmount;
    private BigDecimal totalAmount;


    // =====================================================
    // BASE CURRENCY AMOUNTS (INR)
    // =====================================================

    private BigDecimal baseAmount;
    private BigDecimal baseDiscountAmount;
    private BigDecimal baseTaxableAmount;

    private BigDecimal baseCgstAmount;
    private BigDecimal baseSgstAmount;
    private BigDecimal baseIgstAmount;

    private BigDecimal baseTotalTaxAmount;
    private BigDecimal baseTotalAmount;


    // =====================================================
    // PAYMENT DETAILS
    // =====================================================

    private BigDecimal paidAmount;
    private BigDecimal dueAmount;


    // =====================================================
    // STATUS
    // =====================================================

    private ExpenseStatus expenseStatus;
    private ExpensePaymentStatus paymentStatus;


    // =====================================================
    // APPROVAL DETAILS
    // =====================================================

    private Long approvedBy;
    private LocalDateTime approvedAt;


    // =====================================================
    // REJECTION DETAILS
    // =====================================================

    private Long rejectedBy;
    private LocalDateTime rejectedAt;
    private String rejectionReason;


    // =====================================================
    // NOTES
    // =====================================================

    private String notes;
}
