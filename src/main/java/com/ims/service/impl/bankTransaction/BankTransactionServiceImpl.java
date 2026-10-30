
package com.ims.service.impl.bankTransaction;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;

import com.ims.dtos.bankTransaction.BankTransactionResponseDTO;

import com.ims.entity.BankAccount;
import com.ims.entity.BankTransactionEntity;

import com.ims.enums.BankAccountStatus;
import com.ims.enums.BankTransactionDirection;

import com.ims.repository.BankAccountRepository;
import com.ims.repository.BankTransactionRepository;

import com.ims.service.serviceInterface.bankTransaction.BankTransactionService;
import com.ims.utils.specification.BankTransactionSpecification;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BankTransactionServiceImpl implements BankTransactionService {

    private final BankTransactionRepository bankTransactionRepository;
    private final BankAccountRepository bankAccountRepository;

    // ---------------------------------------------------------
    // GET TRANSACTION BY ID
    // ---------------------------------------------------------

    @Override
    public ApiResponse<BankTransactionResponseDTO> getTransactionById(
            Long transactionId
    ) {

        if (transactionId == null || transactionId <= 0) {
            throw new IllegalArgumentException(
                    "Valid bank transaction ID is required"
            );
        }

        BankTransactionEntity transaction =
                bankTransactionRepository.findByIdAndActiveTrue(transactionId)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Bank transaction not found with ID: "
                                        + transactionId
                        ));

        return ApiResponse.success(
                toResponse(transaction),
                "Bank transaction fetched successfully"
        );
    }

    // ---------------------------------------------------------
    // GET ALL TRANSACTIONS WITH FILTERS
    // ---------------------------------------------------------

    @Override
    public ApiResponse<PageResponse<BankTransactionResponseDTO>>
    getAllTransactions(
            Long bankAccountId,
            LocalDate fromDate,
            LocalDate toDate,
            BankTransactionDirection direction,
            String search,
            Pageable pageable
    ) {

        validateDateRange(fromDate, toDate);
        validatePageable(pageable);

        if (bankAccountId != null) {
            validateBankAccount(bankAccountId);
        }

        Page<BankTransactionEntity> transactionPage =
                bankTransactionRepository.findAll(
                        BankTransactionSpecification.withFilters(
                                bankAccountId,
                                fromDate,
                                toDate,
                                direction,
                                search
                        ),
                        pageable
                );

        return buildPageResponse(
                transactionPage,
                "Bank transactions fetched successfully"
        );
    }

    // ---------------------------------------------------------
    // GET TRANSACTIONS BY BANK ACCOUNT
    // ---------------------------------------------------------

    @Override
    public ApiResponse<PageResponse<BankTransactionResponseDTO>>
    getTransactionsByBankAccount(
            Long bankAccountId,
            Pageable pageable
    ) {

        validateBankAccount(bankAccountId);
        validatePageable(pageable);

        Page<BankTransactionEntity> transactionPage =
                bankTransactionRepository
                        .findAllByBankAccount_IdAndActiveTrue(
                                bankAccountId,
                                pageable
                        );

        return buildPageResponse(
                transactionPage,
                "Bank account transactions fetched successfully"
        );
    }

    // ---------------------------------------------------------
    // GET BANK ACCOUNT BALANCE
    // ---------------------------------------------------------

    @Override
    public ApiResponse<BigDecimal> getAccountBalance(
            Long bankAccountId
    ) {

        BankAccount bankAccount = validateBankAccount(bankAccountId);

        BigDecimal openingBalance = bankAccount.getOpeningBalance();

        if (openingBalance == null) {
            openingBalance = BigDecimal.ZERO;
        }

        BigDecimal netMovement =
                bankTransactionRepository.calculateNetMovement(
                        bankAccountId,
                        BankTransactionDirection.CREDIT
                );

        if (netMovement == null) {
            netMovement = BigDecimal.ZERO;
        }

        BigDecimal currentBalance = openingBalance.add(netMovement);

        return ApiResponse.success(
                currentBalance,
                "Bank account balance fetched successfully"
        );
    }

    // ---------------------------------------------------------
    // BUILD PAGINATION RESPONSE
    // ---------------------------------------------------------

    private ApiResponse<PageResponse<BankTransactionResponseDTO>>
    buildPageResponse(
            Page<BankTransactionEntity> transactionPage,
            String message
    ) {

        Page<BankTransactionResponseDTO> responsePage =
                transactionPage.map(this::toResponse);

        PageResponse<BankTransactionResponseDTO> response =
                PageResponse.<BankTransactionResponseDTO>builder()
                        .content(responsePage.getContent())
                        .pageNumber(responsePage.getNumber())
                        .pageSize(responsePage.getSize())
                        .totalElements(responsePage.getTotalElements())
                        .totalPages(responsePage.getTotalPages())
                        .last(responsePage.isLast())
                        .build();

        return ApiResponse.success(response, message);
    }

    // ---------------------------------------------------------
    // VALIDATE BANK ACCOUNT
    // ---------------------------------------------------------

    private BankAccount validateBankAccount(Long bankAccountId) {

        if (bankAccountId == null || bankAccountId <= 0) {
            throw new IllegalArgumentException(
                    "Valid bank account ID is required"
            );
        }

        BankAccount bankAccount = bankAccountRepository
                .findById(bankAccountId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Bank account not found with ID: " + bankAccountId
                ));

        if (!Boolean.TRUE.equals(bankAccount.getActive())) {
            throw new IllegalArgumentException(
                    "Bank account is inactive"
            );
        }

        if (bankAccount.getStatus() != BankAccountStatus.ACTIVE) {
            throw new IllegalArgumentException(
                    "Bank account status is not ACTIVE"
            );
        }

        return bankAccount;
    }

    // ---------------------------------------------------------
    // VALIDATE DATE RANGE
    // ---------------------------------------------------------

    private void validateDateRange(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        if (fromDate != null &&
                toDate != null &&
                fromDate.isAfter(toDate)) {

            throw new IllegalArgumentException(
                    "From date cannot be after to date"
            );
        }
    }

    // ---------------------------------------------------------
    // VALIDATE PAGEABLE
    // ---------------------------------------------------------

    private void validatePageable(Pageable pageable) {

        if (pageable == null) {
            throw new IllegalArgumentException(
                    "Pagination information is required"
            );
        }
    }

    // ---------------------------------------------------------
    // RESPONSE MAPPER
    // ---------------------------------------------------------

    private BankTransactionResponseDTO toResponse(
            BankTransactionEntity transaction
    ) {

        BankTransactionResponseDTO response =
                new BankTransactionResponseDTO();

        response.setId(transaction.getId());

        response.setTransactionNumber(
                transaction.getTransactionNumber()
        );

        // Bank account details.
        if (transaction.getBankAccount() != null) {

            response.setBankAccountId(
                    transaction.getBankAccount().getId()
            );

            response.setBankAccountName(
                    transaction.getBankAccount().getAccountName()
            );
        }

        // Payment details.
        if (transaction.getPayment() != null) {

            response.setPaymentId(
                    transaction.getPayment().getId()
            );

            response.setPaymentNumber(
                    transaction.getPayment().getPaymentNumber()
            );
        }

        // Party details.
        if (transaction.getParty() != null) {

            response.setPartyId(
                    transaction.getParty().getId()
            );

            response.setPartyName(
                    transaction.getParty().getCompanyName()
            );
        }

        // Transaction details.
        response.setDirection(transaction.getDirection());

        response.setTransactionDate(
                transaction.getTransactionDate()
        );

        response.setAmount(transaction.getAmount());

        response.setBaseAmount(transaction.getBaseAmount());

        response.setExchangeRate(transaction.getExchangeRate());

        response.setCurrencyCode(transaction.getCurrencyCode());

        response.setReferenceNumber(
                transaction.getReferenceNumber()
        );

        response.setDescription(transaction.getDescription());

        // Reversal details.
        if (transaction.getReversalOf() != null) {

            response.setReversalOfId(
                    transaction.getReversalOf().getId()
            );
        }

        return response;
    }
}
