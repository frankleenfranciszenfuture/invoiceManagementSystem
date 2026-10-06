package com.ims.dtos.permission.userPermission;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPermissionMatrixResponse {

    private Long userId;

    private Long moduleId;

    private String moduleName;

    private List<ActionPermission> actions;
}