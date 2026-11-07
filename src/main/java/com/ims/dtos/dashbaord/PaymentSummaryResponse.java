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
public class PaymentSummaryResponse {

    private Long totalPayments;

    private Long completedPayments;

    private Long pendingPayments;

    private Long cancelledPayments;

    private Long failedPayments;
    private Long reversedPayments;

    private BigDecimal totalCollections;

    private BigDecimal totalPaymentsMade;

    private BigDecimal totalCashCollections;

    private BigDecimal totalBankCollections;
}
