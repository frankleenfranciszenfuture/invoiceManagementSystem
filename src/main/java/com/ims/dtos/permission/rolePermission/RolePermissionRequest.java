package com.ims.dtos.permission.rolePermission;

import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class RolePermissionRequest {

    @NotNull
    private Long moduleActionId;

    @NotNull
    private Boolean allowed;

}

//@Data
//public class RolePermissionRequest {
//
//    @NotNull(message = "Role ID is required.")
//    private Long roleId;
//
//    @NotNull(message = "Module ID is required.")
//    private Long moduleId;
//
//    @NotNull(message = "Action ID is required.")
//    private Long actionId;
//
//    @NotNull(message = "Allowed value is required.")
//    private Boolean allowed;
//}
