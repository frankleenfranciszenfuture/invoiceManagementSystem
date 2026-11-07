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
public class ExpenseSummaryResponse {

    private Long expenseCategoryId;

    private String categoryName;

    private BigDecimal amount;

    private Long transactionCount;
}

