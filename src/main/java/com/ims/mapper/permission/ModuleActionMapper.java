package com.ims.mapper.permission;


import com.ims.dtos.permission.moduleAction.ModuleActionResponse;
import com.ims.entity.ModuleActionEntity;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ModuleActionMapper {

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
    ModuleActionResponse toResponse(
            ModuleActionEntity entity
    );
}
