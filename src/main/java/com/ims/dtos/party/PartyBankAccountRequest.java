package com.ims.dtos.party;


import com.ims.enums.Status;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class PartyBankAccountRequest {



    private String bankName;

    private String branchName;

    private String accountHolderName;

    private String accountNumber;

    private String ifscCode;


    private String accountType;


    private Boolean primaryAccount;


    private String remarks;

    private Status status;
}
