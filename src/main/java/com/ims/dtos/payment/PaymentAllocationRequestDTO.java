package com.ims.dtos.payment;

import com.ims.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAllocationRequestDTO {

    @NotNull(message = "Payment amount is required")
    @DecimalMin(value = "0.01", message = "Payment amount must be greater than zero")
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
}