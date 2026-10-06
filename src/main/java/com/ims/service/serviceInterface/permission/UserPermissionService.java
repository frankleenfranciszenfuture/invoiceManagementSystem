package com.ims.service.serviceInterface.permission;

import com.ims.dtos.permission.userPermission.*;
import com.ims.entity.UserBasedPermission;
import com.ims.entity.UserEntity;

import java.util.List;

public interface UserPermissionService {

    List<UserPermissionResponse> assignPermissions(
            Long userId,
            AssignUserPermissionRequest request);

    List<UserPermissionResponse> bulkAssignPermissions(
            BulkAssignUserPermissionRequest request);

    List<UserPermissionResponse> updatePermissions(
            Long userId,
            AssignUserPermissionRequest request);

    List<UserPermissionResponse> bulkUpdatePermissions(
            BulkAssignUserPermissionRequest request);

    List<UserPermissionResponse> getAll();

    UserPermissionResponse getById(Long id);

    void deleteById(Long id);

    List<UserPermissionResponse> getByUser(Long userId);


    List<UserPermissionMatrixResponse> getUserPermission();

    List<UserPermissionMatrixResponse> getUserPermissionById(Long id);

}