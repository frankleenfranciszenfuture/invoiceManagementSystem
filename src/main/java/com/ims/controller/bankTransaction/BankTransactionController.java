
package com.ims.controller.bankTransaction;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;

import com.ims.dtos.bankTransaction.BankTransactionResponseDTO;

import com.ims.enums.BankTransactionDirection;

import com.ims.service.serviceInterface.bankTransaction.BankTransactionService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.format.annotation.DateTimeFormat;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

@RestController
@RequestMapping("/bank-transactions")
@RequiredArgsConstructor
public class BankTransactionController {

    private final BankTransactionService bankTransactionService;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "transactionDate",
            "transactionNumber",
            "amount",
            "createdAt",
            "updatedAt"
    );

    // ---------------------------------------------------------
    // GET TRANSACTION BY ID
    // ---------------------------------------------------------

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BankTransactionResponseDTO>>
    getTransactionById(
            @PathVariable Long id
    ) {

        ApiResponse<BankTransactionResponseDTO> response =
                bankTransactionService.getTransactionById(id);

        return ResponseEntity.ok(response);
    }

    // ---------------------------------------------------------
    // GET ALL TRANSACTIONS WITH FILTERS AND PAGINATION
    // ---------------------------------------------------------

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BankTransactionResponseDTO>>>
    getAllTransactions(

            @RequestParam(required = false) Long bankAccountId,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate,

            @RequestParam(required = false)
            BankTransactionDirection direction,

            @RequestParam(required = false) String search,

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "10") int size,

            @RequestParam(defaultValue = "transactionDate") String sortBy,

            @RequestParam(defaultValue = "desc") String sortDirection
    ) {

        validatePagination(page, size);

        Pageable pageable = PageRequest.of(
                page,
                size,
                getSort(sortBy, sortDirection)
        );

        ApiResponse<PageResponse<BankTransactionResponseDTO>> response =
                bankTransactionService.getAllTransactions(
                        bankAccountId,
                        fromDate,
                        toDate,
                        direction,
                        search,
                        pageable
                );

        return ResponseEntity.ok(response);
    }

    // ---------------------------------------------------------
    // GET TRANSACTIONS BY BANK ACCOUNT
    // ---------------------------------------------------------

    @GetMapping("/bank-account/{bankAccountId}")
    public ResponseEntity<ApiResponse<PageResponse<BankTransactionResponseDTO>>>
    getTransactionsByBankAccount(

            @PathVariable Long bankAccountId,

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "10") int size,

            @RequestParam(defaultValue = "transactionDate") String sortBy,

            @RequestParam(defaultValue = "desc") String sortDirection
    ) {

        validatePagination(page, size);

        Pageable pageable = PageRequest.of(
                page,
                size,
                getSort(sortBy, sortDirection)
        );

        ApiResponse<PageResponse<BankTransactionResponseDTO>> response =
                bankTransactionService.getTransactionsByBankAccount(
                        bankAccountId,
                        pageable
                );

        return ResponseEntity.ok(response);
    }

    // ---------------------------------------------------------
    // GET BANK ACCOUNT BALANCE
    // ---------------------------------------------------------

    @GetMapping("/bank-account/{bankAccountId}/balance")
    public ResponseEntity<ApiResponse<BigDecimal>> getAccountBalance(
            @PathVariable Long bankAccountId
    ) {

        ApiResponse<BigDecimal> response =
                bankTransactionService.getAccountBalance(bankAccountId);

        return ResponseEntity.ok(response);
    }

    // ---------------------------------------------------------
    // PAGINATION VALIDATION
    // ---------------------------------------------------------

    private void validatePagination(int page, int size) {

        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page number cannot be negative"
            );
        }

        if (size <= 0 || size > 100) {
            throw new IllegalArgumentException(
                    "Page size must be between 1 and 100"
            );
        }
    }

    // ---------------------------------------------------------
    // SORTING
    // ---------------------------------------------------------

    private Sort getSort(
            String sortBy,
            String sortDirection
    ) {

        if (sortBy == null || !ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new IllegalArgumentException(
                    "Invalid transaction sort field: " + sortBy
            );
        }

        Sort.Direction direction;

        if ("asc".equalsIgnoreCase(sortDirection)) {
            direction = Sort.Direction.ASC;
        } else if ("desc".equalsIgnoreCase(sortDirection)) {
            direction = Sort.Direction.DESC;
        } else {
            throw new IllegalArgumentException(
                    "Sort direction must be either asc or desc"
            );
        }

        return Sort.by(direction, sortBy);
    }
}
