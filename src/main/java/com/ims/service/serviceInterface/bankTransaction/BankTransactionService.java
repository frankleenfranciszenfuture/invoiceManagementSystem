
package com.ims.service.serviceInterface.bankTransaction;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.bankTransaction.BankTransactionResponseDTO;
import com.ims.enums.BankTransactionDirection;

import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface BankTransactionService {

    /**
     * Get bank transaction details by ID.
     */
    ApiResponse<BankTransactionResponseDTO> getTransactionById(
            Long transactionId
    );

    /**
     * Get bank transactions with optional filters and pagination.
     */
    ApiResponse<PageResponse<BankTransactionResponseDTO>> getAllTransactions(
            Long bankAccountId,
            LocalDate fromDate,
            LocalDate toDate,
            BankTransactionDirection direction,
            String search,
            Pageable pageable
    );

    /**
     * Get transaction history for a specific bank account.
     */
    ApiResponse<PageResponse<BankTransactionResponseDTO>> getTransactionsByBankAccount(
            Long bankAccountId,
            Pageable pageable
    );

    /**
     * Calculate the current bank account balance.
     *
     * Opening balance + credits - debits.
     */
    ApiResponse<BigDecimal> getAccountBalance(
            Long bankAccountId
    );
}
