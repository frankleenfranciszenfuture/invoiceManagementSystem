package com.ims.dtos.party.reports;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartyCreditReportResponse {

    private Long id;

    private String partyCode;

    private String partyType;

    private String companyName;

    private BigDecimal creditLimit;

    private BigDecimal outstandingCredit;

    private BigDecimal outstandingReceivable;

    private BigDecimal outstandingPayable;

    private BigDecimal availableCredit;

    private String paymentTerms;

    private String status;

    private Boolean active;
}