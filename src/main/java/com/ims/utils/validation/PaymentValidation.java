package com.ims.utils.validation;

import com.ims.dtos.payment.PaymentRequestDTO;
import com.ims.entity.BankAccount;
import com.ims.entity.PartyEntity;
import com.ims.enums.BankAccountStatus;
import com.ims.enums.PaymentMethod;
import com.ims.enums.PartyType;
import com.ims.enums.PaymentDirection;
import com.ims.enums.PaymentReferenceType;
import com.ims.repository.BankAccountRepository;
import com.ims.repository.PartyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class PaymentValidation {

    private final PartyRepository partyRepository;
    private final BankAccountRepository bankAccountRepository;

    /**
     * Validate payment request.
     */
    public void validatePaymentRequest(PaymentRequestDTO request) {

        if (request == null) {
            throw new IllegalArgumentException("Payment request is required");
        }

        validateAmount(request.getAmount());

        validateDirection(request.getDirection());

        validateReference(
                request.getReferenceType(),
                request.getReferenceId()
        );

        validatePaymentMethod(
                request.getPaymentMethod(),
                request.getBankAccountId()
        );

        validatePartyType(
                request.getPartyId(),
                request.getDirection()
        );

        if (request.getBankAccountId() != null) {
            validateBankAccount(request.getBankAccountId());
        }
    }

    /**
     * Validate positive payment amount.
     */
    public void validateAmount(BigDecimal amount) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Payment amount must be greater than zero"
            );
        }
    }

    /**
     * Validate payment direction.
     */
    public void validateDirection(PaymentDirection direction) {

        if (direction == null) {
            throw new IllegalArgumentException(
                    "Payment direction is required"
            );
        }
    }

    /**
     * Validate payment reference.
     */
    public void validateReference(
            PaymentReferenceType referenceType,
            Long referenceId
    ) {

        if (referenceType == null) {
            throw new IllegalArgumentException(
                    "Payment reference type is required"
            );
        }

        if (referenceType == PaymentReferenceType.ADVANCE) {

            if (referenceId != null) {
                throw new IllegalArgumentException(
                        "Advance payment must not contain an order reference ID"
                );
            }

            return;
        }

        if (referenceId == null || referenceId <= 0) {
            throw new IllegalArgumentException(
                    "Order reference ID is required"
            );
        }
    }

    /**
     * Validate payment method and bank account requirement.
     */
    public void validatePaymentMethod(
            PaymentMethod paymentMethod,
            Long bankAccountId
    ) {

        if (paymentMethod == null) {
            throw new IllegalArgumentException(
                    "Payment method is required"
            );
        }

        if (paymentMethod == PaymentMethod.CREDIT ||
                paymentMethod == PaymentMethod.PAY_LATER) {

            throw new IllegalArgumentException(
                    "Credit and Pay Later cannot be used as actual payment methods"
            );
        }

        if (paymentMethod == PaymentMethod.CASH) {

            if (bankAccountId != null) {
                throw new IllegalArgumentException(
                        "Cash payment must not contain a bank account"
                );
            }

            return;
        }

        if (bankAccountId == null || bankAccountId <= 0) {
            throw new IllegalArgumentException(
                    "Bank account is required for this payment method"
            );
        }
    }

    /**
     * Validate party and payment direction compatibility.
     */
    public PartyEntity validatePartyType(
            Long partyId,
            PaymentDirection direction
    ) {

        PartyEntity party = partyRepository.findByIdAndActiveTrue(partyId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Active party not found with ID: " + partyId
                ));

        PartyType partyType = party.getPartyType();

        if (direction == PaymentDirection.RECEIVED) {

            if (partyType != PartyType.CUSTOMER &&
                    partyType != PartyType.BOTH) {

                throw new IllegalArgumentException(
                        "Payment received is allowed only from customers"
                );
            }

        } else if (direction == PaymentDirection.PAID) {

            if (partyType != PartyType.SUPPLIER &&
                    partyType != PartyType.BOTH) {

                throw new IllegalArgumentException(
                        "Payment paid is allowed only to suppliers"
                );
            }
        }

        return party;
    }

    /**
     * Validate bank account.
     */
    public BankAccount validateBankAccount(Long bankAccountId) {

        BankAccount bankAccount = bankAccountRepository.findById(bankAccountId)
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
}
