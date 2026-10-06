package com.ims.dtos.permission.userPermission;

import com.ims.dtos.common.BaseResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class BulkAssignUserPermissionResponse extends BaseResponse {

    private Long userId;

    private String userName;

    private List<UserPermissionResponse> permissions;
}

