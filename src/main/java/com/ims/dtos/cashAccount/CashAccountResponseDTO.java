package com.ims.dtos.cashAccount;

import com.ims.dtos.common.BaseResponse;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CashAccountResponseDTO extends BaseResponse {

    private Long id;

    private String accountName;

    private String accountCode;

    private String currency;

    private BigDecimal openingBalance;

    private BigDecimal currentBalance;

    private String description;

    private String status;
}