package com.ims.dtos.permission.rolePermission;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class RolePermissionRoleRequest {

    @NotNull
    private Long roleId;

    @NotEmpty
    @Valid
    private List<RolePermissionRequest> permissions;

}