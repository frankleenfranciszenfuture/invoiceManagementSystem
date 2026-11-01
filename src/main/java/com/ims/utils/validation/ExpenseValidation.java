
package com.ims.utils.validation;

import com.ims.dtos.expenses.ExpenseRequestDTO;
import com.ims.entity.ExpenseEntity;
import com.ims.enums.ExpenseStatus;
import com.ims.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class ExpenseValidation {

    public void validateCreate(ExpenseRequestDTO dto) {

        if (dto.getAmount() == null ||
                dto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {

            throw new BadRequestException(
                    "Expense amount must be greater than zero."
            );
        }

        BigDecimal discount = zeroIfNull(dto.getDiscountAmount());

        if (discount.compareTo(dto.getAmount()) > 0) {
            throw new BadRequestException(
                    "Discount cannot be greater than expense amount."
            );
        }

        if (dto.getExchangeRate() != null &&
                dto.getExchangeRate().compareTo(BigDecimal.ZERO) <= 0) {

            throw new BadRequestException(
                    "Exchange rate must be greater than zero."
            );
        }

        // Tax is selected using taxMasterId.
        // Actual GST rates and tax amounts are validated/calculated
        // in ExpenseServiceImpl using TaxMasterEntity.
    }

    public void validateUpdate(ExpenseEntity expense) {

        if (expense.getExpenseStatus() != ExpenseStatus.DRAFT) {
            throw new BadRequestException(
                    "Only DRAFT expenses can be updated. Current status: "
                            + expense.getExpenseStatus()
            );
        }
    }

    public void validateCanApprove(ExpenseEntity expense) {

        if (expense.getExpenseStatus() != ExpenseStatus.DRAFT) {
            throw new BadRequestException(
                    "Only DRAFT expenses can be approved."
            );
        }
    }

    public void validateCanReject(ExpenseEntity expense) {

        if (expense.getExpenseStatus() != ExpenseStatus.DRAFT) {
            throw new BadRequestException(
                    "Only DRAFT expenses can be rejected."
            );
        }
    }

    public void validateCanCancel(ExpenseEntity expense) {

        if (expense.getExpenseStatus() == ExpenseStatus.CANCELLED ||
                expense.getExpenseStatus() == ExpenseStatus.REJECTED) {

            throw new BadRequestException(
                    "This expense cannot be cancelled."
            );
        }

        if (expense.getPaidAmount() != null &&
                expense.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {

            throw new BadRequestException(
                    "Payments must be reversed before cancelling this expense."
            );
        }
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
