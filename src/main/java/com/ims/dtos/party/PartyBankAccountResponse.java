package com.ims.dtos.party;


import com.ims.dtos.common.BaseResponse;
import com.ims.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PartyBankAccountResponse extends BaseResponse {


    private Long id;


    //=====================================================
    // PARTY
    //=====================================================

    private Long partyId;


    //=====================================================
    // BANK DETAILS
    //=====================================================

    private String bankName;


    private String accountHolderName;


    private String accountNumber;


    private String ifscCode;


    private String branchName;


    private String accountType;


    private Boolean primaryAccount;


    private String remarks;


    //=====================================================
    // STATUS
    //=====================================================

    private Status status;

}