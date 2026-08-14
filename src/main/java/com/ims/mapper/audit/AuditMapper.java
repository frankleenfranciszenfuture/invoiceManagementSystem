package com.ims.mapper.audit;


import com.ims.dtos.common.AuditResponse;
import com.ims.entity.BaseEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AuditMapper {

    AuditResponse toAudit(BaseEntity entity);
}