package com.ims.dtos.audit.enityAuditSnapShot;


import com.ims.enums.Status;
import com.ims.enums.TaxType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxMasterAuditSnapshot {

    private Long id;

    private String taxName;

    private TaxType taxType;

    private BigDecimal taxRate;

    private BigDecimal cgstRate;

    private BigDecimal sgstRate;

    private BigDecimal igstRate;

    private String description;

    private Boolean active;

    private Status status;
}