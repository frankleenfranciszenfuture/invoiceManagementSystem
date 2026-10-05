package com.ims.mapper.permission;

import com.ims.dtos.permission.module.ModuleRequest;
import com.ims.dtos.permission.module.ModuleResponse;
import com.ims.entity.ModuleEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ModuleMapper {

    @Mapping(target = "status", ignore = true)
    ModuleEntity toEntity(ModuleRequest request);

    ModuleResponse toResponse(ModuleEntity entity);

    @Mapping(target = "status", ignore = true)
    void updateEntity(
            ModuleRequest request,
            @MappingTarget ModuleEntity entity
    );
}