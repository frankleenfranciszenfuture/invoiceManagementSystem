package com.ims.dtos.currency;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CurrencyRequestDTO {

    @NotBlank
    @Pattern(
            regexp = "^[A-Za-z]{3}$",
            message = "Currency code must contain exactly 3 letters"
    )
    private String code;

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 10)
    private String symbol;

    @NotNull
    @Min(0)
    @Max(4)
    private Integer decimalPlaces = 2;

    private Boolean active = true;
}