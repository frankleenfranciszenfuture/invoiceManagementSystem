
package com.ims.dtos.payment;

import com.ims.enums.PaymentMethod;
import com.ims.enums.PaymentDirection;
import com.ims.enums.PaymentReferenceType;
import com.ims.enums.PaymentStatus;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentFilterDTO {

    private String search;

    private Long partyId;

    private Long bankAccountId;

    private PaymentDirection direction;

    private PaymentReferenceType referenceType;

    private PaymentMethod paymentMethod;

    private PaymentStatus status;

    private LocalDate fromDate;

    private LocalDate toDate;
}
