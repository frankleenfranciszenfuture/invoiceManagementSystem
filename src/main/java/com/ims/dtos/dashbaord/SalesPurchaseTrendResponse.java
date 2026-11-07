package com.ims.dtos.dashbaord;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesPurchaseTrendResponse {

    private String month;

    private Integer year;

    private BigDecimal sales;

    private BigDecimal purchases;
}
