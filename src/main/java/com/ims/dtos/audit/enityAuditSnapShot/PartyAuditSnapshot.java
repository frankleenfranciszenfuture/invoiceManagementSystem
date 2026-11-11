package com.ims.dtos.audit.enityAuditSnapShot;


import com.ims.enums.PartyType;
import com.ims.enums.Status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartyAuditSnapshot {

    private Long id;

    private String partyCode;

    private PartyType partyType;

    private String companyName;

    private String contactPerson;

    private String email;

    private String mobile;

    private String alternateMobile;

    private String gstNumber;

    private String panNumber;

    private String website;

    private BigDecimal creditLimit;

    private BigDecimal outstandingCredit;

    private BigDecimal outstandingReceivable;

    private BigDecimal outstandingPayable;

    private String paymentTerms;

    private Status status;

    private Boolean active;

    private List<PartyAddressAuditSnapshot> addresses;

    private List<PartyBankAccountAuditSnapshot> bankAccounts;
}
