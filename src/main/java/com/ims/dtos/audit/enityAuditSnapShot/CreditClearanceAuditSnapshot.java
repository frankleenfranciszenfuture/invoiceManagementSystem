package com.ims.dtos.audit.enityAuditSnapShot;



import com.ims.enums.PartyType;
import com.ims.enums.PaymentMethod;
import com.ims.enums.Status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditClearanceAuditSnapshot {

    private Long id;

    private String clearanceNo;

    // PARTY
    private Long partyId;

    private String partyCode;

    private String partyName;

    private PartyType partyType;

    // CREDIT DETAILS
    private BigDecimal creditLimit;

    private BigDecimal clearanceAmount;

    private BigDecimal previousOutstandingCredit;

    private BigDecimal remainingOutstandingCredit;

    // PAYMENT
    private PaymentMethod paymentMethod;

    private String paymentReferenceNumber;

    // DATE
    private LocalDate clearanceDate;

    // REMARKS
    private String remarks;

    // STATUS
    private Status status;

    private Boolean active;
}
