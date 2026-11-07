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
public class ReceivablePayableResponse {

    private BigDecimal receivables;

    private BigDecimal payables;

    private BigDecimal overdueReceivables;

    private BigDecimal overduePayables;
}
