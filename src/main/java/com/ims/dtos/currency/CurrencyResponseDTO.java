package com.ims.dtos.currency;

import com.ims.enums.CurrencyStatus;
import com.ims.enums.Status;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyResponseDTO {

    private Long id;
    private String currencyCode;
    private String currencyName;
    private String symbol;
    private Integer decimalPlaces;
    private CurrencyStatus status;
    private Boolean active;
}
