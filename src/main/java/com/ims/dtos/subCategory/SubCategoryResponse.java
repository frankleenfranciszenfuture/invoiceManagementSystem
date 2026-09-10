package com.ims.dtos.subCategory;

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
public class SubCategoryResponse extends BaseResponse {


    private Long id;

    private String subCategoryCode;


    private String name;


    private String description;


    private Long categoryId;


    private String categoryCode;

    private String categoryName;

    private Status status;

    private Integer displayOrder;

}