package com.ims.dtos.salesPerson;

import com.ims.dtos.common.BaseResponse;
import com.ims.enums.SalesPersonType;
import com.ims.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class SalesPersonResponse extends BaseResponse {

    private Long id;

    private String salesPersonCode;

    private SalesPersonType salesPersonType;

    private String salesPersonName;

    private String email;

    private String mobile;

    private Status status;

}
