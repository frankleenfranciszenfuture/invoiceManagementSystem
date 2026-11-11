package com.ims.dtos.audit.enityAuditSnapShot;


import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAuditSnapshot {

    private Long id;

    private String paymentNumber;

    private String paymentType;

    private String paymentDirection;

    private Long sourceId;

    private String sourceNumber;

    private LocalDate paymentDate;

    private BigDecimal paymentAmount;

    private BigDecimal baseAmount;

    private BigDecimal exchangeRate;

    private Long currencyId;

    private String currencyCode;

    private String paymentMethod;

    private Long bankAccountId;

    private String bankAccountName;

    private Long cashAccountId;

    private String cashAccountName;

    private Long customerId;

    private String customerName;

    private Long partyId;

    private String partyName;

    private String referenceNumber;

    private String notes;

    private String paymentStatus;

    private String reversalReason;

    private Boolean active;
}

