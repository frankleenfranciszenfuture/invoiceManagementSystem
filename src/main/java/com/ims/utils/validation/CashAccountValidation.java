package com.ims.utils.validation;

import com.ims.dtos.cashAccount.CashAccountRequestDTO;
import com.ims.entity.CashAccountEntity;
import com.ims.repository.CashAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CashAccountValidation {

    private final CashAccountRepository cashAccountRepository;

    public void validateCreate(CashAccountRequestDTO request) {

        String accountCode = request.getAccountCode().trim();

        if (cashAccountRepository
                .existsByAccountCodeIgnoreCaseAndActiveTrue(accountCode)) {
            throw new IllegalArgumentException(
                    "Cash account code already exists"
            );
        }
    }

    public CashAccountEntity validateAndGet(Long id) {

        return cashAccountRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Cash account not found")
                );
    }

    public void validateUpdate(
            Long id,
            CashAccountRequestDTO request
    ) {

        if (cashAccountRepository
                .existsByAccountCodeIgnoreCaseAndActiveTrueAndIdNot(
                        request.getAccountCode().trim(),
                        id
                )) {
            throw new IllegalArgumentException(
                    "Cash account code already exists"
            );
        }
    }
}