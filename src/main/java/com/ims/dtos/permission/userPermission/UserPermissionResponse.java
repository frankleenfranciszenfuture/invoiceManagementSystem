package com.ims.dtos.permission.userPermission;

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
public class UserPermissionResponse extends BaseResponse {
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
}

//@Data
//public class UserPermissionResponse {
//
//    private Long id;
//
//    private Long userId;
//
//    private String userName;
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
