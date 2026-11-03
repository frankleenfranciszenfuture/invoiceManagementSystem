package com.ims.dtos.payment;

import com.ims.dtos.common.BaseResponse;
import com.ims.enums.PaymentDirection;
import com.ims.enums.PaymentMethod;
import com.ims.enums.PaymentStatus;
import com.ims.enums.PaymentType;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PaymentResponseDTO extends BaseResponse {

    private Long id;

    private String paymentNumber;

    private PaymentType paymentType;

    private PaymentDirection paymentDirection;

    private Long sourceId;

    private String sourceNumber;

    private LocalDate paymentDate;

    private BigDecimal paymentAmount;

    private BigDecimal baseAmount;

    private BigDecimal exchangeRate;

    private Long currencyId;

    private String currencyCode;

    private String currencyName;

    private PaymentMethod paymentMethod;

    private Long bankAccountId;

    private String bankAccountName;

    private Long cashAccountId;

    private String cashAccountName;

    private Long customerId;

    private String customerName;

    private Long partyId;

    private String partyName;

    private String referenceNumber;


    private List<PaymentResponseDTO> allocations;
    private BigDecimal totalAllocatedAmount;
    private Integer allocationCount;

    private String notes;

    private PaymentStatus paymentStatus;

    private String reversalReason;

}