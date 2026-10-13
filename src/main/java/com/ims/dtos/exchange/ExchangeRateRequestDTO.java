package com.ims.dtos.exchange;


import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExchangeRateRequestDTO {

    @NotBlank
    @Pattern(regexp = "^[A-Za-z]{3}$")
    private String fromCurrencyCode;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z]{3}$")
    private String toCurrencyCode;

    @NotNull
    @DecimalMin(value = "0.000001")
    @Digits(integer = 12, fraction = 6)
    private BigDecimal rate;

    @NotNull
    private LocalDate effectiveDate;

    private Boolean active = true;
}