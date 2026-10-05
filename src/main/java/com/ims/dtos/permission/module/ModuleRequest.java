package com.ims.dtos.permission.module;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class ModuleRequest {

    @NotBlank(message = "Module name is required.")
    @Size(
            max = 100,
            message = "Module name cannot exceed 100 characters."
    )
    private String moduleName;

    @Size(
            max = 255,
            message = "Description cannot exceed 255 characters."
    )
    private String description;
}