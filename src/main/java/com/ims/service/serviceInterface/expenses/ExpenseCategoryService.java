package com.ims.service.serviceInterface.expenses;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.expenses.ExpenseCategoryRequestDTO;
import com.ims.dtos.expenses.ExpenseCategoryResponseDTO;
import com.ims.enums.ExpenseCategoryStatus;
import com.ims.enums.ExpenseType;

import org.springframework.data.domain.Pageable;

public interface ExpenseCategoryService {

    // Create
    ApiResponse<ExpenseCategoryResponseDTO> create(
            ExpenseCategoryRequestDTO dto
    );

    // Update
    ApiResponse<ExpenseCategoryResponseDTO> update(
            Long id,
            ExpenseCategoryRequestDTO dto
    );

    // Get by ID
    ApiResponse<ExpenseCategoryResponseDTO> getById(Long id);

    // Get all with filters and pagination
    ApiResponse<PageResponse<ExpenseCategoryResponseDTO>> getAll(
            String search,
            ExpenseType expenseType,
            ExpenseCategoryStatus status,
            Pageable pageable
    );

    // Delete
    ApiResponse<Void> delete(Long id);
}