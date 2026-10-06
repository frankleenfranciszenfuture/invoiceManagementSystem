package com.ims.dtos.permission.userPermission;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserBasedPermission {

    private Long userId;
    private Long moduleId;
    private String moduleName;
    private List<ActionPermission> actions;
}

//@Data
//public class UserPermissionRequest {
//
//    @NotNull(message = "User ID is required.")
//    private Long userId;
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
