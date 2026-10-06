package com.ims.dtos.permission.userPermission;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActionPermission {

    private Long actionId;

    private String actionName;

    private boolean allowed;
}

