
package com.ims.dtos.bankTransaction;

import com.ims.dtos.common.BaseResponse;
import com.ims.enums.BankTransactionDirection;

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
public class BankTransactionResponseDTO extends BaseResponse {

    private Long id;

    private String transactionNumber;

    // Bank account details
    private Long bankAccountId;
    private String bankAccountName;

    // Payment details
    private Long paymentId;
    private String paymentNumber;

    // Party details
    private Long partyId;
    private String partyName;

    // Transaction details
    private BankTransactionDirection direction;

    private LocalDate transactionDate;

    // Original bank account currency amount
    private BigDecimal amount;

    // INR converted amount
    private BigDecimal baseAmount;

    // INR value of one unit of transaction currency
    private BigDecimal exchangeRate;

    private String currencyCode;

    private String referenceNumber;

    private String description;

    // Original transaction ID for reversal transactions
    private Long reversalOfId;
}
