package com.ims.mapper.role;

import com.ims.dtos.role.RoleRequest;
import com.ims.dtos.role.RoleResponse;
import com.ims.entity.RoleEntity;
import com.ims.mapper.audit.AuditMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring",
        uses = AuditMapper.class)
public interface RoleMapper {

    // Create
    RoleEntity toEntity(RoleRequest request);

    // Response
    @Mapping(target = "audit", source = ".")
    RoleResponse toDTO(RoleEntity entity);

    // Update Existing Entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "active", ignore = true)
    void updateEntity(RoleRequest request, @MappingTarget RoleEntity entity);

}