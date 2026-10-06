package com.ims.dtos.permission.userPermission;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class UserPermissionAssign {

    @NotNull(message = "User Id is required.")
    private Long userId;

    @NotEmpty(message = "Permissions are required.")
    @Valid
    private List<UserPermissionRequest> permissions;
}
