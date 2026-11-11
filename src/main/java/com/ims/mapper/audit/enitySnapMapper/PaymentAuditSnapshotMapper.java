package com.ims.mapper.audit.enitySnapMapper;


import com.ims.common.audit.AuditSnapshotMapper;

import com.ims.dtos.audit.enityAuditSnapShot.PaymentAuditSnapshot;
import com.ims.entity.PaymentEntity;

import org.springframework.stereotype.Component;

@Component
public class PaymentAuditSnapshotMapper implements AuditSnapshotMapper {

    @Override
    public boolean supports(String entityName) {
        return "PAYMENT".equalsIgnoreCase(entityName);
    }

    @Override
    public Object toSnapshot(Object entity) {

        if (!(entity instanceof PaymentEntity payment)) {
            throw new IllegalArgumentException(
                    "Invalid entity supplied to PaymentAuditSnapshotMapper."
            );
        }

        return PaymentAuditSnapshot.builder()

                .id(payment.getId())

                .paymentNumber(payment.getPaymentNumber())

                .paymentType(payment.getPaymentType() != null
                        ? payment.getPaymentType().name()
                        : null)

                .paymentDirection(payment.getPaymentDirection() != null
                        ? payment.getPaymentDirection().name()
                        : null)

                .sourceId(payment.getSourceId())
                .sourceNumber(payment.getSourceNumber())

                .paymentDate(payment.getPaymentDate())

                .paymentAmount(payment.getPaymentAmount())
                .baseAmount(payment.getBaseAmount())
                .exchangeRate(payment.getExchangeRate())

                .currencyId(payment.getCurrency() != null
                        ? payment.getCurrency().getId()
                        : null)

                .currencyCode(payment.getCurrencyCode())

                .paymentMethod(payment.getPaymentMethod() != null
                        ? payment.getPaymentMethod().name()
                        : null)

                .bankAccountId(payment.getBankAccount() != null
                        ? payment.getBankAccount().getId()
                        : null)

                .bankAccountName(payment.getBankAccount() != null
                        ? payment.getBankAccount().getAccountName()
                        : null)

                .cashAccountId(payment.getCashAccount() != null
                        ? payment.getCashAccount().getId()
                        : null)

                .cashAccountName(payment.getCashAccount() != null
                        ? payment.getCashAccount().getAccountName()
                        : null)

                .customerId(payment.getCustomer() != null
                        ? payment.getCustomer().getId()
                        : null)

                .customerName(payment.getCustomer() != null
                        ? payment.getCustomer().getDisplayName()
                        : null)

                .partyId(payment.getParty() != null
                        ? payment.getParty().getId()
                        : null)

                .partyName(payment.getParty() != null
                        ? payment.getParty().getCompanyName()
                        : null)

                .referenceNumber(payment.getReferenceNumber())
                .notes(payment.getNotes())

                .paymentStatus(payment.getPaymentStatus() != null
                        ? payment.getPaymentStatus().name()
                        : null)

                .reversalReason(payment.getReversalReason())

                .build();
    }
}

