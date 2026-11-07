package com.ims.dtos.dashbaord;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecentTransactionResponse {

    private Long id;

    private String transactionNumber;

    private String transactionType;

    private String partyName;

    private LocalDate transactionDate;

    private BigDecimal amount;

    private String paymentMethod;

    private String status;
}

