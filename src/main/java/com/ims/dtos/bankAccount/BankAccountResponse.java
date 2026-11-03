package com.ims.dtos.bankAccount;

import com.ims.dtos.common.BaseResponse;
import com.ims.enums.BankAccountStatus;
import com.ims.enums.BankAccountType;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
public class BankAccountResponse extends BaseResponse {

    private Long id;

    private BankAccountType accountType;

    private String accountName;

    private String accountCode;

    private String currency;

    private String accountNumber;

    private String bankName;

    private String branchName;

    private String ifsc;

    private String swiftCode;

    private List<Long> userIds;

    private String description;

    private BigDecimal openingBalance;

    private BigDecimal currentBalance;

    private Boolean primaryAccount;

    private BankAccountStatus status;

    private Boolean active;
}