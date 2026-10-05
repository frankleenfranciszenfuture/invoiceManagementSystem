package com.ims.dtos.permission.moduleAction;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ModuleActionRequest {

    @NotNull(message = "Module ID is required.")
    private Long moduleId;

    @NotNull(message = "Action ID is required.")
    private Long actionId;
}
