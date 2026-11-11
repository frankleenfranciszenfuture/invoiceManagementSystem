package com.ims.dtos.audit.enityAuditSnapShot;


import com.ims.enums.CurrencyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyAuditSnapshot {

    private Long id;

    private String currencyCode;

    private String currencyName;

    private String symbol;

    private Integer decimalPlaces;

    private CurrencyStatus status;

    private Boolean active;
}