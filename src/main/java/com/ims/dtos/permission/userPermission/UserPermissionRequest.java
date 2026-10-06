package com.ims.dtos.permission.userPermission;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserPermissionRequest {

    @NotNull(message = "Module Action Id is required.")
    private Long moduleActionId;

    @NotNull(message = "Allowed is required.")
    private Boolean allowed;
}
