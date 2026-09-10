package com.ims.dtos.category;

import com.ims.enums.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CategoryRequest {


    @NotBlank(message = "Category name is required.")
    @Size(max = 100, message = "Category name cannot exceed 100 characters.")
    private String categoryName;

    @Size(max = 500, message = "Description cannot exceed 500 characters.")
    private String description;

    @NotNull(message = "Status is required.")
    private Status status;
}
