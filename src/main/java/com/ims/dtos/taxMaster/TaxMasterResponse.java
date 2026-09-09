package com.ims.dtos.taxMaster;


import com.ims.dtos.common.BaseResponse;
import com.ims.enums.Status;
import com.ims.enums.TaxType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TaxMasterResponse extends BaseResponse {

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
