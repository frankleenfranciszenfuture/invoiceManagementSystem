package com.ims.utils.validation;

import com.ims.dtos.cashAccount.CashAccountRequestDTO;
import com.ims.entity.CashAccountEntity;
import com.ims.enums.CashAccountStatus;
import com.ims.repository.CashAccountRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CashAccountValidation {

    private final CashAccountRepository cashAccountRepository;

    // ==========================================
    // CREATE VALIDATION
    // ==========================================

    public void validateCreate(CashAccountRequestDTO request) {

        String accountCode = request.getAccountCode().trim();

        if (cashAccountRepository
                .existsByAccountCodeIgnoreCaseAndStatusNot(
                        accountCode,
                        CashAccountStatus.DELETED.name()
                )) {

            throw new IllegalArgumentException(
                    "Cash account code already exists"
            );
        }
    }

    // ==========================================
    // GET ACCOUNT - EXCLUDE DELETED
    // ==========================================

    public CashAccountEntity validateAndGet(Long id) {

        return cashAccountRepository
                .findByIdAndStatusNot(
                        id,
                        CashAccountStatus.DELETED.name()
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Cash account not found"
                        )
                );
    }

    // ==========================================
    // UPDATE VALIDATION
    // ==========================================

    public void validateUpdate(
            Long id,
            CashAccountRequestDTO request
    ) {

        String accountCode = request.getAccountCode().trim();

        if (cashAccountRepository
                .existsByAccountCodeIgnoreCaseAndStatusNotAndIdNot(
                        accountCode,
                        CashAccountStatus.DELETED.name(),
                        id
                )) {

            throw new IllegalArgumentException(
                    "Cash account code already exists"
            );
        }
    }
}