package com.ims.dtos.audit.enityAuditSnapShot;


import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashAccountAuditSnapshot {

    private Long id;

    private String accountName;

    private String accountCode;

    private String currency;

    private BigDecimal openingBalance;

    private BigDecimal currentBalance;

    private String description;

    private String status;

    private Boolean active;
}

