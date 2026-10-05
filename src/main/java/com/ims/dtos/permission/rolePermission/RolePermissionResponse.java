package com.ims.dtos.permission.rolePermission;

import com.ims.enums.Status;
import lombok.Data;

@Data
public class RolePermissionResponse {

    private Long id;

    private Long roleId;

    private String roleName;

    private Long moduleId;

    private String moduleName;

    private Long actionId;

    private String actionName;

    private Boolean allowed;

    private Status status;

    private Boolean active;
}
