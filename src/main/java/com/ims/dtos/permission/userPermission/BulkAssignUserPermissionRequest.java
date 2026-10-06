package com.ims.dtos.permission.userPermission;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BulkAssignUserPermissionRequest {

    @NotEmpty(message = "Users are required.")
    @Valid
    private List<UserPermissionAssign> users;
}
