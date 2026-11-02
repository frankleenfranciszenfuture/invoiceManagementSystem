package com.ims.dtos.cashAccount;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CashAccountRequestDTO {

    @NotBlank(message = "Account name is required")
    @Size(max = 150, message = "Account name cannot exceed 150 characters")
    private String accountName;

    @NotBlank(message = "Account code is required")
    @Size(max = 50, message = "Account code cannot exceed 50 characters")
    private String accountCode;

    @NotBlank(message = "Currency is required")
    @Size(max = 10, message = "Currency cannot exceed 10 characters")
    private String currency;

    @NotNull(message = "Opening balance is required")
    @DecimalMin(value = "0.00", message = "Opening balance cannot be negative")
    @Digits(integer = 15, fraction = 4, message = "Invalid opening balance")
    private BigDecimal openingBalance;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotBlank(message = "Status is required")
    @Pattern(
            regexp = "ACTIVE|INACTIVE",
            message = "Status must be ACTIVE or INACTIVE"
    )
    private String status;
}