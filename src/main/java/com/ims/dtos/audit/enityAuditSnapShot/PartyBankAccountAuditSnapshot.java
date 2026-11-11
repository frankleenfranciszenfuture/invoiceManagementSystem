package com.ims.dtos.audit.enityAuditSnapShot;

import com.ims.enums.Status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartyBankAccountAuditSnapshot {

    private Long id;

    private String bankName;

    private String accountHolderName;

    private String accountNumber;

    private String ifscCode;

    private String branchName;

    private String accountType;

    private Boolean primaryAccount;

    private String remarks;

    private Status status;

    private Boolean active;
}
