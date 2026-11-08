package com.ims.utils.validation;

import com.ims.dtos.bankAccount.BankAccountCreateRequest;
import com.ims.dtos.bankAccount.BankAccountUpdateRequest;
import com.ims.entity.BankAccount;
import com.ims.enums.BankAccountStatus;
import com.ims.repository.BankAccountRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class BankAccountValidation {

    private final BankAccountRepository bankAccountRepository;

    // =====================================================
    // CREATE
    // =====================================================

    public void validateCreate(
            BankAccountCreateRequest request
    ) {

        // -------------------------------------------------
        // ACCOUNT CODE
        // -------------------------------------------------

        if (StringUtils.hasText(request.getAccountCode())
                && bankAccountRepository
                .existsByAccountCodeIgnoreCaseAndStatusNot(
                        request.getAccountCode().trim(),
                        BankAccountStatus.DELETED
                )) {

            throw new IllegalArgumentException(
                    "Account code already exists"
            );
        }

        // -------------------------------------------------
        // ACCOUNT NUMBER
        // -------------------------------------------------

        if (StringUtils.hasText(request.getAccountNumber())
                && bankAccountRepository
                .existsByAccountNumberAndStatusNot(
                        request.getAccountNumber().trim(),
                        BankAccountStatus.DELETED
                )) {

            throw new IllegalArgumentException(
                    "Account number already exists"
            );
        }

        // -------------------------------------------------
        // PRIMARY ACCOUNT
        // -------------------------------------------------

        validatePrimaryOnCreate(
                request.getPrimaryAccount()
        );
    }


    // =====================================================
    // UPDATE
    // =====================================================

    public void validateUpdate(
            Long id,
            BankAccountUpdateRequest request
    ) {

        BankAccount existingAccount =
                bankAccountRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Bank account not found"
                                )
                        );

        if (existingAccount.getStatus() == BankAccountStatus.DELETED) {
            throw new IllegalArgumentException(
                    "Deleted bank account cannot be updated"
            );
        }

        // -------------------------------------------------
        // ACCOUNT CODE
        // -------------------------------------------------

        if (StringUtils.hasText(request.getAccountCode())
                && !sameIgnoreCase(
                existingAccount.getAccountCode(),
                request.getAccountCode()
        )
                && bankAccountRepository
                .existsByAccountCodeIgnoreCaseAndStatusNotAndIdNot(
                        request.getAccountCode().trim(),
                        BankAccountStatus.DELETED,
                        id
                )) {

            throw new IllegalArgumentException(
                    "Account code already exists"
            );
        }

        // -------------------------------------------------
        // ACCOUNT NUMBER
        // -------------------------------------------------

        if (StringUtils.hasText(request.getAccountNumber())
                && !same(
                existingAccount.getAccountNumber(),
                request.getAccountNumber()
        )
                && bankAccountRepository
                .existsByAccountNumberAndStatusNotAndIdNot(
                        request.getAccountNumber().trim(),
                        BankAccountStatus.DELETED,
                        id
                )) {

            throw new IllegalArgumentException(
                    "Account number already exists"
            );
        }

        // -------------------------------------------------
        // PRIMARY ACCOUNT
        // -------------------------------------------------

        if (Boolean.TRUE.equals(request.getPrimaryAccount())
                && !Boolean.TRUE.equals(
                existingAccount.getPrimaryAccount()
        )
                && bankAccountRepository
                .existsByPrimaryAccountTrueAndStatusNotAndIdNot(
                        BankAccountStatus.DELETED,
                        id
                )) {

            throw new IllegalArgumentException(
                    "Another primary bank account already exists"
            );
        }
    }


    // =====================================================
    // PRIMARY ACCOUNT - CREATE
    // =====================================================

    private void validatePrimaryOnCreate(
            Boolean primaryAccount
    ) {

        if (Boolean.TRUE.equals(primaryAccount)
                && bankAccountRepository
                .existsByPrimaryAccountTrueAndStatusNot(
                        BankAccountStatus.DELETED
                )) {

            throw new IllegalArgumentException(
                    "Another primary bank account already exists"
            );
        }
    }


    // =====================================================
    // CASE INSENSITIVE COMPARISON
    // =====================================================

    private boolean sameIgnoreCase(
            String existingValue,
            String requestedValue
    ) {

        if (existingValue == null && requestedValue == null) {
            return true;
        }

        if (existingValue == null || requestedValue == null) {
            return false;
        }

        return existingValue.trim()
                .equalsIgnoreCase(requestedValue.trim());
    }


    // =====================================================
    // NORMAL COMPARISON
    // =====================================================

    private boolean same(
            String existingValue,
            String requestedValue
    ) {

        if (existingValue == null && requestedValue == null) {
            return true;
        }

        if (existingValue == null || requestedValue == null) {
            return false;
        }

        return existingValue.trim()
                .equals(requestedValue.trim());
    }
}