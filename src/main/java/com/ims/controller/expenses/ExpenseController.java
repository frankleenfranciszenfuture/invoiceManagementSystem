package com.ims.controller.expenses;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.expenses.ExpenseRequestDTO;
import com.ims.dtos.expenses.ExpenseResponseDTO;
import com.ims.enums.ExpensePaymentStatus;
import com.ims.enums.ExpenseStatus;
import com.ims.enums.ExpenseType;
import com.ims.service.serviceInterface.expenses.ExpenseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    // ---------------------------------------------------------
    // CREATE EXPENSE
    // ---------------------------------------------------------

    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponseDTO>> create(
            @Valid @RequestBody ExpenseRequestDTO dto
    ) {
        return ResponseEntity.ok(
                expenseService.create(dto)
        );
    }

    // ---------------------------------------------------------
    // UPDATE EXPENSE
    // ---------------------------------------------------------

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponseDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequestDTO dto
    ) {
        return ResponseEntity.ok(
                expenseService.update(id, dto)
        );
    }

    // ---------------------------------------------------------
    // GET EXPENSE BY ID
    // ---------------------------------------------------------

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponseDTO>> getById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                expenseService.getById(id)
        );
    }

    // ---------------------------------------------------------
    // GET ALL EXPENSES WITH FILTERS
    // ---------------------------------------------------------

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ExpenseResponseDTO>>> getAll(

            @RequestParam(required = false) String search,

            @RequestParam(required = false) ExpenseType expenseType,

            @RequestParam(required = false) Long categoryId,

            @RequestParam(required = false) ExpenseStatus expenseStatus,

            @RequestParam(required = false) ExpensePaymentStatus paymentStatus,

            @RequestParam(required = false) LocalDate fromDate,

            @RequestParam(required = false) LocalDate toDate,

            @RequestParam(required = false) String vendorName,

            @RequestParam(required = false) Long currencyId,

            @RequestParam(required = false) Long warehouseId,

            @PageableDefault(size = 10, sort = "createdAt")
            Pageable pageable
    ) {
        return ResponseEntity.ok(
                expenseService.getAll(
                        search,
                        expenseType,
                        categoryId,
                        expenseStatus,
                        paymentStatus,
                        fromDate,
                        toDate,
                        vendorName,
                        currencyId,
                        warehouseId,
                        pageable
                )
        );
    }

    // ---------------------------------------------------------
    // APPROVE EXPENSE
    // ---------------------------------------------------------

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<ExpenseResponseDTO>> approve(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                expenseService.approve(id)
        );
    }

    // ---------------------------------------------------------
    // REJECT EXPENSE
    // ---------------------------------------------------------

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ExpenseResponseDTO>> reject(
            @PathVariable Long id,
            @RequestParam String reason
    ) {
        return ResponseEntity.ok(
                expenseService.reject(id, reason)
        );
    }

    // ---------------------------------------------------------
    // CANCEL EXPENSE
    // ---------------------------------------------------------

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ExpenseResponseDTO>> cancel(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                expenseService.cancel(id)
        );
    }
}