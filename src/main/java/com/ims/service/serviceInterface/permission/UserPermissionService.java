package com.ims.service.serviceInterface.permission;

import com.ims.dtos.permission.userPermission.UserPermissionRequest;
import com.ims.dtos.permission.userPermission.UserPermissionResponse;
import com.ims.dtos.permission.userPermission.UserPermissionUpdateRequest;

import java.util.List;

public interface UserPermissionService {

    UserPermissionResponse create(
            UserPermissionRequest request
    );

    UserPermissionResponse update(
            Long id,
            UserPermissionUpdateRequest request
    );;

    UserPermissionResponse getById(
            Long id
    );

    List<UserPermissionResponse> getAll();

    List<UserPermissionResponse> getByUser(
            Long userId
    );

    void delete(Long id);
}