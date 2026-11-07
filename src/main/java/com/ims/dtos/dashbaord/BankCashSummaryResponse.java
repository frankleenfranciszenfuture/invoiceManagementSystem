package com.ims.dtos.dashbaord;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BankCashSummaryResponse {

    private BigDecimal totalBankBalance;

    private BigDecimal totalCashBalance;

    private BigDecimal totalAvailableBalance;

    private Long totalBankAccounts;

    private Long totalCashAccounts;
}

