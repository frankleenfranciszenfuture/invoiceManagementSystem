package com.ims.dtos.payment;

import com.ims.enums.PaymentMethod;
import com.ims.enums.PaymentType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {

    @NotNull(message = "Payment type is required")
    private PaymentType paymentType;

    @NotNull(message = "Source document ID is required")
    @Positive(message = "Source document ID must be positive")
    private Long sourceId;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    @NotNull(message = "Payment amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Payment amount must be greater than zero"
    )
    @Digits(
            integer = 15,
            fraction = 4,
            message = "Payment amount supports up to 4 decimal places"
    )
    private BigDecimal paymentAmount;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private Long bankAccountId;

    private Long cashAccountId;

    @Size(max = 100, message = "Reference number cannot exceed 100 characters")
    private String referenceNumber;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;
}