package com.ims.dtos.subCategory;

import com.ims.dtos.common.BaseResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class SubCategoryDropdownResponse extends BaseResponse {

    private Long id;

    private String code;

    private String label;

}
