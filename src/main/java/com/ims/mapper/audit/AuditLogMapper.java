package com.ims.mapper.audit;

import com.ims.entity.AuditLogEntity;
import com.ims.dtos.audit.AuditLogResponse;
import com.ims.dtos.common.AuditResponse;

import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {

    @Mapping(target = "audit", ignore = true)
    AuditLogResponse toResponse(AuditLogEntity entity);

    @AfterMapping
    default void setAudit(
            AuditLogEntity entity,
            @MappingTarget AuditLogResponse response) {

        response.setAudit(
                AuditResponse.builder()
                        .createdAt(entity.getCreatedAt())
                        .build()
        );
    }
}
