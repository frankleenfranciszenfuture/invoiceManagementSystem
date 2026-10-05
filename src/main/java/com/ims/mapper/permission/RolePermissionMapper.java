package com.ims.mapper.permission;


import com.ims.dtos.permission.rolePermission.RolePermissionResponse;
import com.ims.entity.RoleBasedPermission;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RolePermissionMapper {

    @Mapping(
            target = "roleId",
            source = "role.id"
    )
    @Mapping(
            target = "roleName",
            source = "role.roleName"
    )
    @Mapping(
            target = "moduleId",
            source = "module.id"
    )
    @Mapping(
            target = "moduleName",
            source = "module.moduleName"
    )
    @Mapping(
            target = "actionId",
            source = "action.id"
    )
    @Mapping(
            target = "actionName",
            source = "action.actionName"
    )
    @Mapping(target = "status", ignore = true)
    RolePermissionResponse toResponse(
            RoleBasedPermission entity
    );
}
