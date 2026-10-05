package com.ims.mapper.permission;


import com.ims.dtos.permission.action.ActionRequest;
import com.ims.dtos.permission.action.ActionResponse;
import com.ims.entity.ActionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ActionMapper {

    @Mapping(target = "status", ignore = true)
    ActionEntity toEntity(ActionRequest request);

    ActionResponse toResponse(ActionEntity entity);

    @Mapping(target = "status", ignore = true)
    void updateEntity(
            ActionRequest request,
            @MappingTarget ActionEntity entity
    );
}
