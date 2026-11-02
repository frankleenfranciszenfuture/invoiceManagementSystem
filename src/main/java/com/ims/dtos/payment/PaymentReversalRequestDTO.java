package com.ims.dtos.payment;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentReversalRequestDTO {

    @NotBlank(message = "Reversal reason is required")
    @Size(max = 500, message = "Reversal reason cannot exceed 500 characters")
    private String reversalReason;
}