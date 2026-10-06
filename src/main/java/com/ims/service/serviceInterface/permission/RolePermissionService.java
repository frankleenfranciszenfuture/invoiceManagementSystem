package com.ims.service.serviceInterface.permission;

import com.ims.dtos.permission.rolePermission.*;

import java.util.List;

public interface RolePermissionService {

    /* =========================================================
       GET PERMISSIONS BY ROLE
       ========================================================= */

    List<RolePermissionResponse> getPermissionsByRole(
            Long roleId
    );


    /* =========================================================
       ASSIGN PERMISSIONS TO ROLE
       ========================================================= */

    List<RolePermissionResponse> assignPermissions(
            Long roleId,
            AssignRolePermissionRequest request
    );


    /* =========================================================
       BULK ASSIGN PERMISSIONS TO ROLES
       ========================================================= */

    List<RolePermissionResponse> assignPermissionsToRoles(
            BulkRolePermissionRequest request
    );


    /* =========================================================
       UPDATE PERMISSIONS FOR ROLE
       ========================================================= */

    List<RolePermissionResponse> updatePermissions(
            Long roleId,
            AssignRolePermissionRequest request
    );


    /* =========================================================
       BULK UPDATE PERMISSIONS FOR ROLES
       ========================================================= */

    List<RolePermissionResponse> updatePermissionsToRoles(
            BulkRolePermissionRequest request
    );


    /* =========================================================
       GET ALL
       ========================================================= */

    List<RolePermissionResponse> getAll();


    /* =========================================================
       GET BY ID
       ========================================================= */

    RolePermissionResponse getById(
            Long id
    );


    /* =========================================================
       DELETE
       ========================================================= */

    void deleteById(
            Long id
    );
}