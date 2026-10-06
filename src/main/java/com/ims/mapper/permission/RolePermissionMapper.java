package com.ims.mapper.permission;


import com.ims.dtos.permission.rolePermission.RolePermissionResponse;
import com.ims.entity.RoleBasedPermission;

import com.ims.mapper.audit.AuditMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring",
        uses = AuditMapper.class)
public interface RolePermissionMapper {

    @Mapping(target = "roleId", source = "role.id")
    @Mapping(target = "moduleId", source = "module.id")
    @Mapping(target = "moduleName", source = "module.moduleName")
    @Mapping(target = "actionId", source = "action.id")
    @Mapping(target = "actionName", source = "action.actionName")
    @Mapping(target = "audit", source = ".")
    RolePermissionResponse toDTO(RoleBasedPermission entity);

    @Mapping(target = "audit", source = ".")
    List<RolePermissionResponse> toDTO(List<RoleBasedPermission> entities);
}

