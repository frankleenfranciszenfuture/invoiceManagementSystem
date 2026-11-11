package com.ims.dtos.audit.enityAuditSnapShot;



import com.ims.enums.BankAccountStatus;
import com.ims.enums.BankAccountType;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankAccountAuditSnapshot {

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

    private Boolean primaryAccount;

    private BankAccountStatus status;

    private BigDecimal openingBalance;

    private BigDecimal currentBalance;

    private Boolean active;
}

