package com.ims.dtos.category;

import com.ims.dtos.common.BaseResponse;
import com.ims.dtos.subCategory.SubCategoryResponse;
import com.ims.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CategoryResponse extends BaseResponse {

    private Long id;



    private String categoryCode;

    private String categoryName;

    private String description;

    private Status status;

    private List<SubCategoryResponse> subCategories;
}