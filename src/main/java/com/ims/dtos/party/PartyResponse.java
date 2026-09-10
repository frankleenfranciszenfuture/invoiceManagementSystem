package com.ims.dtos.party;


import com.ims.dtos.common.BaseResponse;
import com.ims.enums.PartyType;
import com.ims.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PartyResponse extends BaseResponse {

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

    private String paymentTerms;

    private Status status;


    private List<PartyAddressResponse> addresses;

    private List<PartyBankAccountResponse> bankAccounts;
}