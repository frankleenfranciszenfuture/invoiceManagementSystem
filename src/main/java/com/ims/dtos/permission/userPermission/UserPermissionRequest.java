package com.ims.dtos.permission.userPermission;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserPermissionRequest {

    @NotNull(message = "User ID is required.")
    private Long userId;

    @NotNull(message = "Module ID is required.")
    private Long moduleId;

    @NotNull(message = "Action ID is required.")
    private Long actionId;

    @NotNull(message = "Allowed value is required.")
    private Boolean allowed;
}
