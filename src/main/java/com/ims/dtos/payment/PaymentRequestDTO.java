package com.ims.dtos.payment;

import com.ims.enums.PaymentMethod;
import com.ims.enums.PaymentType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

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

    // Used for normal payments only
    @DecimalMin(value = "0.01", message = "Payment amount must be greater than zero")
    @Digits(integer = 15, fraction = 4)
    private BigDecimal paymentAmount;

    // Used for normal payments only
    private PaymentMethod paymentMethod;

    private Long bankAccountId;

    private Long cashAccountId;

    @Size(max = 100)
    private String referenceNumber;

    @Size(max = 1000)
    private String notes;

    // Used for split payments
    @Valid
    private List<@NotNull PaymentAllocationRequestDTO> allocations;

    @AssertTrue(message = "Provide either a normal payment or payment allocations, not both")
    public boolean isPaymentRequestValid() {

        boolean splitMode = allocations != null && !allocations.isEmpty();

        boolean normalMode =
                paymentAmount != null ||
                        paymentMethod != null ||
                        bankAccountId != null ||
                        cashAccountId != null;

        if (splitMode) {
            return !normalMode;
        }

        return paymentAmount != null && paymentMethod != null;
    }
}