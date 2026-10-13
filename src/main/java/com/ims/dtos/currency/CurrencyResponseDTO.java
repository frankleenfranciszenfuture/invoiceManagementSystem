package com.ims.dtos.currency;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyResponseDTO {

    private Long id;
    private String code;
    private String name;
    private String symbol;
    private Integer decimalPlaces;
    private Boolean active;
}
