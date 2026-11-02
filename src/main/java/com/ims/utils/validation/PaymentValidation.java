package com.ims.utils.validation;

import com.ims.entity.BankAccount;
import com.ims.entity.CashAccountEntity;
import com.ims.enums.BankAccountStatus;
import com.ims.enums.PaymentMethod;
import com.ims.repository.BankAccountRepository;
import com.ims.repository.CashAccountRepository;
import com.ims.dtos.payment.PaymentRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentValidation {

    private final BankAccountRepository bankAccountRepository;
    private final CashAccountRepository cashAccountRepository;

    public BankAccount validateBankAccount(Long bankAccountId) {

        if (bankAccountId == null) {
            throw new IllegalArgumentException(
                    "Bank account is required for this payment method"
            );
        }

        BankAccount bankAccount = bankAccountRepository.findById(bankAccountId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Bank account not found"
                ));

        if (!Boolean.TRUE.equals(bankAccount.getActive())
                || bankAccount.getStatus() != BankAccountStatus.ACTIVE) {
            throw new IllegalArgumentException(
                    "Selected bank account is inactive"
            );
        }

        return bankAccount;
    }

    public CashAccountEntity validateCashAccount(Long cashAccountId) {

        if (cashAccountId == null) {
            throw new IllegalArgumentException(
                    "Cash account is required for cash payments"
            );
        }

        return cashAccountRepository.findByIdAndActiveTrue(cashAccountId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Cash account not found or inactive"
                ));
    }

    public void validatePaymentAccount(PaymentRequestDTO request) {

        if (request.getPaymentMethod() == null) {
            throw new IllegalArgumentException(
                    "Payment method is required"
            );
        }

        if (request.getPaymentMethod() == PaymentMethod.CASH) {

            if (request.getCashAccountId() == null) {
                throw new IllegalArgumentException(
                        "Select a cash account for cash payments"
                );
            }

            if (request.getBankAccountId() != null) {
                throw new IllegalArgumentException(
                        "Bank account must not be selected for cash payments"
                );
            }

            validateCashAccount(request.getCashAccountId());

        } else {

            if (request.getBankAccountId() == null) {
                throw new IllegalArgumentException(
                        "Select a bank account for this payment method"
                );
            }

            if (request.getCashAccountId() != null) {
                throw new IllegalArgumentException(
                        "Cash account must not be selected for bank payments"
                );
            }

            validateBankAccount(request.getBankAccountId());
        }
    }
}