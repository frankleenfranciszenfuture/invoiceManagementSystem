package com.ims.dtos.permission.userPermission;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserPermissionUpdateRequest {

    @NotNull(message = "Allowed value is required.")
    private Boolean allowed;
}
