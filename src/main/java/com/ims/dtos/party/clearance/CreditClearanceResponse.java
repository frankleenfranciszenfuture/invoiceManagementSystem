package com.ims.dtos.party.clearance;


import com.ims.dtos.common.BaseResponse;
import com.ims.enums.PartyType;
import com.ims.enums.PaymentMethod;
import com.ims.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CreditClearanceResponse extends BaseResponse {

    private Long id;

    private String clearanceNo;

    private Long partyId;
    private String partyCode;
    private String partyName;
    private PartyType partyType;

    private BigDecimal creditLimit;

    private BigDecimal clearanceAmount;

    private BigDecimal previousOutstandingCredit;

    private BigDecimal remainingOutstandingCredit;

    private BigDecimal availableCreditBeforeClearance;

    private BigDecimal availableCreditAfterClearance;

    private PaymentMethod paymentMethod;

    private String paymentReferenceNumber;

    private LocalDate clearanceDate;

    private String remarks;

    private Status status;
}
