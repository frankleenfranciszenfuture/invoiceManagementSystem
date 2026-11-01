package com.ims.controller.expenses;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.expenses.ExpenseCategoryRequestDTO;
import com.ims.dtos.expenses.ExpenseCategoryResponseDTO;
import com.ims.enums.ExpenseCategoryStatus;
import com.ims.enums.ExpenseType;
import com.ims.service.serviceInterface.expenses.ExpenseCategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/expense-categories")
@RequiredArgsConstructor
public class ExpenseCategoryController {

    private final ExpenseCategoryService expenseCategoryService;

    // ---------------------------------------------------------
    // CREATE CATEGORY
    // ---------------------------------------------------------

    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseCategoryResponseDTO>> create(
            @Valid @RequestBody ExpenseCategoryRequestDTO dto
    ) {
        return ResponseEntity.ok(
                expenseCategoryService.create(dto)
        );
    }

    // ---------------------------------------------------------
    // UPDATE CATEGORY
    // ---------------------------------------------------------

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseCategoryResponseDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseCategoryRequestDTO dto
    ) {
        return ResponseEntity.ok(
                expenseCategoryService.update(id, dto)
        );
    }

    // ---------------------------------------------------------
    // GET CATEGORY BY ID
    // ---------------------------------------------------------

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseCategoryResponseDTO>> getById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                expenseCategoryService.getById(id)
        );
    }

    // ---------------------------------------------------------
    // GET ALL CATEGORIES WITH FILTERS
    // ---------------------------------------------------------

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ExpenseCategoryResponseDTO>>> getAll(

            @RequestParam(required = false) String search,

            @RequestParam(required = false) ExpenseType expenseType,

            @RequestParam(required = false) ExpenseCategoryStatus status,

            @PageableDefault(size = 10, sort = "createdAt")
            Pageable pageable
    ) {
        return ResponseEntity.ok(
                expenseCategoryService.getAll(
                        search,
                        expenseType,
                        status,
                        pageable
                )
        );
    }

    // ---------------------------------------------------------
    // DELETE CATEGORY
    // ---------------------------------------------------------

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                expenseCategoryService.delete(id)
        );
    }
}