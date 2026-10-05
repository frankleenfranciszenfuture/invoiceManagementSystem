package com.ims.mapper.permission;


import com.ims.dtos.permission.userPermission.UserPermissionResponse;
import com.ims.entity.UserBasedPermission;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserPermissionMapper {

    @Mapping(
            target = "userId",
            source = "user.id"
    )
    @Mapping(
            target = "userName",
            source = "user.name"
    )
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
    @Mapping(target = "status", source = "status")
    UserPermissionResponse toResponse(
            UserBasedPermission entity
    );
}
