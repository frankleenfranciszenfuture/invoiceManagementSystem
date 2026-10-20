package com.ims.dtos.party.clearance;


import com.ims.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CreditClearanceRequest {

    @NotNull(message = "Party is required.")
    private Long partyId;

    @NotNull(message = "Clearance amount is required.")
    @DecimalMin(
            value = "0.01",
            message = "Clearance amount must be greater than zero."
    )
    private BigDecimal clearanceAmount;

    @NotNull(message = "Payment method is required.")
    private PaymentMethod paymentMethod;

    private String paymentReferenceNumber;

    @NotNull(message = "Clearance date is required.")
    private LocalDate clearanceDate;

    private String remarks;
}
