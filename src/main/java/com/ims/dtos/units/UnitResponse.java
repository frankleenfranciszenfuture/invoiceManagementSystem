package com.ims.dtos.units;


import com.ims.dtos.common.BaseResponse;
import com.ims.enums.Status;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;


@Getter
@Setter
@SuperBuilder
public class UnitResponse extends BaseResponse {


    private Long id;

    private String unitName;

    private String unitShortName;

    private String unitCode;

    private String description;

    private Status status;

}