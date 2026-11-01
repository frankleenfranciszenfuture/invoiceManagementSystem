package com.ims.utils.validation;

import com.ims.dtos.expenses.ExpenseCategoryRequestDTO;
import com.ims.entity.ExpenseCategoryEntity;
import com.ims.exception.BadRequestException;
import com.ims.repository.ExpenseCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ExpenseCategoryValidation {

    private final ExpenseCategoryRepository categoryRepository;

    public void validateCreate(ExpenseCategoryRequestDTO dto) {
        if (categoryRepository.existsByCategoryNameIgnoreCase(
                dto.getCategoryName().trim())) {
            throw new BadRequestException("Expense category already exists.");
        }
    }

    public ExpenseCategoryEntity validateAndGet(Long id) {
        return categoryRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() ->
                        new BadRequestException("Expense category not found.")
                );
    }

    public void validateUpdate(
            Long id,
            ExpenseCategoryRequestDTO dto
    ) {
        ExpenseCategoryEntity existing = validateAndGet(id);

        if (categoryRepository.existsByCategoryNameIgnoreCaseAndIdNot(
                dto.getCategoryName().trim(), id)) {
            throw new BadRequestException("Expense category already exists.");
        }
    }
}
