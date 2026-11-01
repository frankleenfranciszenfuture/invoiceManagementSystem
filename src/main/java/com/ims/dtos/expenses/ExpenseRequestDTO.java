
package com.ims.dtos.expenses;

import com.ims.enums.ExpenseType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseRequestDTO {

    // =====================================================
    // EXPENSE DETAILS
    // =====================================================

    @NotNull(message = "Expense type is required")
    private ExpenseType expenseType;

    @NotNull(message = "Expense category is required")
    private Long expenseCategoryId;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;

    @Size(max = 1000)
    private String description;

    @Size(max = 100)
    private String referenceNo;


    // =====================================================
    // VENDOR / SUPPLIER
    // =====================================================

    private Long vendorId;


    // =====================================================
    // WAREHOUSE
    // =====================================================

    private Long warehouseId;


    // =====================================================
    // CURRENCY
    // =====================================================

    @NotNull(message = "Currency is required")
    private Long currencyId;


    // =====================================================
    // TAX MASTER
    // =====================================================

    private Long taxMasterId;


    // =====================================================
    // AMOUNTS
    // =====================================================

    @NotNull(message = "Amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Amount must be greater than zero"
    )
    private BigDecimal amount;

    @DecimalMin(
            value = "0.00",
            message = "Discount cannot be negative"
    )
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;


    // =====================================================
    // NOTES
    // =====================================================

    @Size(max = 1000)
    private String notes;
}
