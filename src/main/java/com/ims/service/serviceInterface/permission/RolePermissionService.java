package com.ims.service.serviceInterface.permission;

import com.ims.dtos.permission.rolePermission.RolePermissionRequest;
import com.ims.dtos.permission.rolePermission.RolePermissionResponse;
import com.ims.dtos.permission.rolePermission.RolePermissionUpdateRequest;

import java.util.List;

public interface RolePermissionService {

    RolePermissionResponse create(
            RolePermissionRequest request
    );

    RolePermissionResponse update(
            Long id,
            RolePermissionUpdateRequest request
    ) ;

    RolePermissionResponse getById(
            Long id
    );

    List<RolePermissionResponse> getAll();

    List<RolePermissionResponse> getByRole(
            Long roleId
    );

    void delete(Long id);
}
