package com.ims.dtos.taxMaster;

import com.ims.enums.Status;
import com.ims.enums.TaxType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class TaxMasterRequest {

    @NotBlank(message = "Tax name is required")
    @Size(max = 100, message = "Tax name must not exceed 100 characters")
    private String taxName;

    @NotNull(message = "Tax type is required")
    private TaxType taxType;

    @NotNull(message = "Tax rate is required")
    @DecimalMin(
            value = "0.00",
            inclusive = true,
            message = "Tax rate cannot be negative"
    )
    @Digits(
            integer = 3,
            fraction = 2,
            message = "Tax rate must have maximum 3 integer digits and 2 decimal places"
    )
    private BigDecimal taxRate;

    @DecimalMin(
            value = "0.00",
            inclusive = true,
            message = "CGST rate cannot be negative"
    )
    @Digits(
            integer = 3,
            fraction = 2,
            message = "CGST rate must have maximum 3 integer digits and 2 decimal places"
    )
    private BigDecimal cgstRate;

    @DecimalMin(
            value = "0.00",
            inclusive = true,
            message = "SGST rate cannot be negative"
    )
    @Digits(
            integer = 3,
            fraction = 2,
            message = "SGST rate must have maximum 3 integer digits and 2 decimal places"
    )
    private BigDecimal sgstRate;

    @DecimalMin(
            value = "0.00",
            inclusive = true,
            message = "IGST rate cannot be negative"
    )
    @Digits(
            integer = 3,
            fraction = 2,
            message = "IGST rate must have maximum 3 integer digits and 2 decimal places"
    )
    private BigDecimal igstRate;

    @Size(
            max = 255,
            message = "Description must not exceed 255 characters"
    )
    private String description;

    private Status status;
}
