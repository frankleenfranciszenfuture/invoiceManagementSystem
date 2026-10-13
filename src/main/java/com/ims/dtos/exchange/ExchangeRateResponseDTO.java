package com.ims.dtos.exchange;


import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRateResponseDTO {

    private Long id;

    private Long fromCurrencyId;
    private String fromCurrencyCode;
    private String fromCurrencyName;

    private Long toCurrencyId;
    private String toCurrencyCode;
    private String toCurrencyName;

    private BigDecimal rate;
    private LocalDate effectiveDate;
    private Boolean active;
}
