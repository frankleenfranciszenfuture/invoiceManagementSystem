package com.ims.dtos.bankAccount;


import com.ims.enums.BankAccountStatus;

import com.ims.enums.BankAccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class BankAccountCreateRequest {

    @NotNull(message = "Account type is required")
    private BankAccountType accountType;

    @NotBlank(message = "Account name is required")
    @Size(
            max = 150,
            message = "Account name must not exceed 150 characters"
    )
    private String accountName;

    @NotBlank(message = "Account code is required")
    @Size(
            max = 50,
            message = "Account code must not exceed 50 characters"
    )
    private String accountCode;

    @Size(
            max = 10,
            message = "Currency must not exceed 10 characters"
    )
    private String currency;

    @NotBlank(message = "Account number is required")
    @Size(
            max = 100,
            message = "Account number must not exceed 100 characters"
    )
    private String accountNumber;

    @Size(
            max = 150,
            message = "Bank name must not exceed 150 characters"
    )
    private String bankName;

    @Size(
            max = 20,
            message = "IFSC must not exceed 20 characters"
    )
    private String ifsc;

    private List<Long> userIds;

    private String description;

    @NotNull(message = "Primary account status is required")
    private Boolean primaryAccount;

    @NotNull(message = "Bank account status is required")
    private BankAccountStatus status;
}
