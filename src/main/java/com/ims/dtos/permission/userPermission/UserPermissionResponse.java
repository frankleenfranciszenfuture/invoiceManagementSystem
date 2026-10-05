package com.ims.dtos.permission.userPermission;

import com.ims.enums.Status;
import lombok.Data;

@Data
public class UserPermissionResponse {

    private Long id;

    private Long userId;

    private String userName;

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
