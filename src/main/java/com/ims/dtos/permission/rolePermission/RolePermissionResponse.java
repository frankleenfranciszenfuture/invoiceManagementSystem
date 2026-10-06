package com.ims.dtos.permission.rolePermission;

import com.ims.dtos.common.BaseResponse;
import com.ims.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;


@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class RolePermissionResponse extends BaseResponse {

    private Long id;

    private Long roleId;

    private Long moduleId;

    private String moduleName;

    private Long actionId;

    private String actionName;

    private Boolean allowed;
}


//@Data
//public class RolePermissionResponse {
//
//    private Long id;
//
//    private Long roleId;
//
//    private String roleName;
//
//    private Long moduleId;
//
//    private String moduleName;
//
//    private Long actionId;
//
//    private String actionName;
//
//    private Boolean allowed;
//
//    private Status status;
//
//    private Boolean active;
//}
