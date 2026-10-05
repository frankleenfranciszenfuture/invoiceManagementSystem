package com.ims.dtos.permission.action;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActionRequest {

    @NotBlank(message = "Action name is required.")
    @Size(
            max = 50,
            message = "Action name cannot exceed 50 characters."
    )
    private String actionName;

    @Size(
            max = 255,
            message = "Description cannot exceed 255 characters."
    )
    private String description;
}