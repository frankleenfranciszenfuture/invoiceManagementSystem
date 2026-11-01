package com.ims.service.serviceInterface.expenses;



import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.expenses.ExpenseRequestDTO;
import com.ims.dtos.expenses.ExpenseResponseDTO;
import com.ims.enums.ExpensePaymentStatus;
import com.ims.enums.ExpenseStatus;
import com.ims.enums.ExpenseType;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface ExpenseService {

    ApiResponse<ExpenseResponseDTO> create(
            ExpenseRequestDTO dto
    );

    ApiResponse<ExpenseResponseDTO> update(
            Long id,
            ExpenseRequestDTO dto
    );

    ApiResponse<ExpenseResponseDTO> getById(
            Long id
    );

    ApiResponse<PageResponse<ExpenseResponseDTO>> getAll(
            String search,
            ExpenseType expenseType,
            Long categoryId,
            ExpenseStatus expenseStatus,
            ExpensePaymentStatus paymentStatus,
            LocalDate fromDate,
            LocalDate toDate,
            String vendorName,
            Long currencyId,
            Long warehouseId,
            Pageable pageable
    );

    ApiResponse<ExpenseResponseDTO> approve(
            Long id
    );

    ApiResponse<ExpenseResponseDTO> reject(
            Long id,
            String reason
    );

    ApiResponse<ExpenseResponseDTO> cancel(
            Long id
    );
}