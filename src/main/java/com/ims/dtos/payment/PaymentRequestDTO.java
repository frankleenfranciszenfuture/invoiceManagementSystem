
package com.ims.dtos.payment;

import com.ims.enums.PaymentMethod;
import com.ims.enums.PaymentDirection;
import com.ims.enums.PaymentReferenceType;
import jakarta.validation.constraints.*;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {

    @NotNull(message = "Payment direction is required")
    private PaymentDirection direction;

    @NotNull(message = "Reference type is required")
    private PaymentReferenceType referenceType;

    private Long referenceId;

    @NotNull(message = "Party is required")
    @Positive(message = "Party ID must be positive")
    private Long partyId;

    private Long bankAccountId;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    @NotNull(message = "Payment amount is required")
    @DecimalMin(value = "0.01", message = "Payment amount must be greater than zero")
    @Digits(integer = 15, fraction = 4)
    private BigDecimal amount;

    @NotBlank(message = "Currency code is required")
    @Size(min = 3, max = 3, message = "Currency code must contain 3 characters")
    private String currencyCode;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @Size(max = 100)
    private String transactionReference;

    @Size(max = 1000)
    private String notes;
}
