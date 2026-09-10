package com.ims.dtos.subCategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UpdateSubCategoryRequest {


    @NotBlank(
            message = "Sub Category name is required"
    )
    @Size(
            max = 150
    )
    private String name;


    @Size(
            max = 500
    )
    private String description;


    @NotNull(
            message = "Category is required"
    )
    private Long categoryId;


    private Integer displayOrder;


    private Boolean active;

}