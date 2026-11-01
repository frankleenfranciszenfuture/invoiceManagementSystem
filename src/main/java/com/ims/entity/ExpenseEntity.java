
package com.ims.entity;

import com.ims.enums.ExpensePaymentStatus;
import com.ims.enums.ExpenseStatus;
import com.ims.enums.ExpenseType;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "expenses",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_expense_no",
                        columnNames = "expense_no"
                )
        },
        indexes = {
                @Index(name = "idx_expense_date", columnList = "expense_date"),
                @Index(name = "idx_expense_status", columnList = "expense_status"),
                @Index(name = "idx_expense_category", columnList = "expense_category_id"),
                @Index(name = "idx_expense_vendor", columnList = "vendor_id"),
                @Index(name = "idx_expense_currency", columnList = "currency_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ExpenseEntity extends BaseEntity {

    // =====================================================
    // PRIMARY KEY
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =====================================================
    // EXPENSE NUMBER
    // =====================================================

    @Column(name = "expense_no", nullable = false, length = 50)
    private String expenseNo;


    // =====================================================
    // EXPENSE TYPE
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "expense_type", nullable = false, length = 20)
    private ExpenseType expenseType;


    // =====================================================
    // EXPENSE CATEGORY
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "expense_category_id", nullable = false)
    private ExpenseCategoryEntity expenseCategory;


    // =====================================================
    // EXPENSE DETAILS
    // =====================================================

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(length = 1000)
    private String description;

    @Column(name = "reference_no", length = 100)
    private String referenceNo;


    // =====================================================
    // VENDOR / SUPPLIER
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private PartyEntity vendor;


    // =====================================================
    // WAREHOUSE
    // =====================================================

    @Column(name = "warehouse_id")
    private Long warehouseId;


    // =====================================================
    // CURRENCY
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "currency_id", nullable = false)
    private Currency currency;

    /**
     * INR value of one unit of the selected currency.
     * Example: USD -> INR = 83.50
     */
    @Column(
            name = "exchange_rate",
            precision = 19,
            scale = 8,
            nullable = false
    )
    @Builder.Default
    private BigDecimal exchangeRate = BigDecimal.ONE;


    // =====================================================
    // TAX MASTER
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_master_id")
    private TaxMasterEntity taxMaster;


    // =====================================================
    // SELECTED CURRENCY AMOUNTS
    // =====================================================

    @Column(
            name = "amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(
            name = "discount_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(
            name = "taxable_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal taxableAmount = BigDecimal.ZERO;

    @Column(
            name = "cgst_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal cgstAmount = BigDecimal.ZERO;

    @Column(
            name = "sgst_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal sgstAmount = BigDecimal.ZERO;

    @Column(
            name = "igst_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal igstAmount = BigDecimal.ZERO;

    @Column(
            name = "total_tax_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal totalTaxAmount = BigDecimal.ZERO;

    @Column(
            name = "total_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;


    // =====================================================
    // BASE CURRENCY AMOUNTS (INR)
    // =====================================================

    @Column(
            name = "base_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal baseAmount = BigDecimal.ZERO;

    @Column(
            name = "base_discount_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal baseDiscountAmount = BigDecimal.ZERO;

    @Column(
            name = "base_taxable_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal baseTaxableAmount = BigDecimal.ZERO;

    @Column(
            name = "base_cgst_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal baseCgstAmount = BigDecimal.ZERO;

    @Column(
            name = "base_sgst_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal baseSgstAmount = BigDecimal.ZERO;

    @Column(
            name = "base_igst_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal baseIgstAmount = BigDecimal.ZERO;

    @Column(
            name = "base_total_tax_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal baseTotalTaxAmount = BigDecimal.ZERO;

    @Column(
            name = "base_total_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal baseTotalAmount = BigDecimal.ZERO;


    // =====================================================
    // PAYMENT AMOUNTS
    // =====================================================

    @Column(
            name = "paid_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(
            name = "due_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal dueAmount = BigDecimal.ZERO;


    // =====================================================
    // EXPENSE STATUS
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "expense_status", nullable = false, length = 20)
    @Builder.Default
    private ExpenseStatus expenseStatus = ExpenseStatus.DRAFT;


    // =====================================================
    // PAYMENT STATUS
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    @Builder.Default
    private ExpensePaymentStatus paymentStatus = ExpensePaymentStatus.UNPAID;


    // =====================================================
    // APPROVAL DETAILS
    // =====================================================

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;


    // =====================================================
    // REJECTION DETAILS
    // =====================================================

    @Column(name = "rejected_by")
    private Long rejectedBy;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;


    // =====================================================
    // NOTES
    // =====================================================

    @Column(length = 1000)
    private String notes;
}
