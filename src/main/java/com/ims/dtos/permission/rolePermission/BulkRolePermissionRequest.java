package com.ims.dtos.permission.rolePermission;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BulkRolePermissionRequest {

    @NotEmpty
    @Valid
    private List<RolePermissionRoleRequest> roles;
}

