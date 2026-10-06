package com.ims.dtos.permission.userPermission;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class AssignUserPermissionRequest {

    @NotEmpty(message = "Permissions are required.")
    @Valid
    private List<UserPermissionRequest> permissions;
}

