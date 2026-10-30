
package com.ims.dtos.payment;

// Change this import to your actual BaseResponse package.
import com.ims.dtos.common.BaseResponse;

import com.ims.enums.PaymentMethod;
import com.ims.enums.PaymentDirection;
import com.ims.enums.PaymentReferenceType;
import com.ims.enums.PaymentStatus;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDTO extends BaseResponse {

    private Long id;

    private String paymentNumber;

    private PaymentDirection direction;

    private PaymentReferenceType referenceType;

    private Long referenceId;

    private Long partyId;

    private String partyCode;

    private String partyName;

    private Long bankAccountId;

    private String bankAccountName;

    private LocalDate paymentDate;

    private BigDecimal amount;

    private BigDecimal baseAmount;

    private BigDecimal exchangeRate;

    private String currencyCode;

    private PaymentMethod paymentMethod;

    private PaymentStatus status;

    private String transactionReference;

    private String notes;

    private Long bankTransactionId;

    private String bankTransactionNumber;
}
