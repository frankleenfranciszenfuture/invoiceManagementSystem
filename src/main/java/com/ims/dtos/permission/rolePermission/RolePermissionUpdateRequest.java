package com.ims.dtos.permission.rolePermission;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RolePermissionUpdateRequest {

    @NotNull(message = "Allowed value is required.")
    private Boolean allowed;
}
