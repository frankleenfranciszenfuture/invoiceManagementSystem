package com.ims.dtos.bankAccount;

import com.ims.enums.BankAccountStatus;
import com.ims.enums.BankAccountType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class BankAccountSearchRequest {

    private String search;

    private BankAccountType accountType;

    private String accountName;

    private String accountCode;

    private String currency;

    private String accountNumber;

    private String bankName;

    private String ifsc;

    private BankAccountStatus status;

    private Boolean primaryAccount;

    private Boolean active;
}
