package com.ims.dtos.sizes;


import com.ims.dtos.common.BaseResponse;
import com.ims.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SizeResponse extends BaseResponse {

    private Long id;

    private String sizeName;

    private String sizeShortName;

    private String sizeCode;

    private Status status;

}