package com.ims.mapper.audit.enitySnapMapper;

import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.CategoryAuditSnapshot;
import com.ims.entity.CategoryEntity;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryAuditMapper extends AuditSnapshotMapper {

    CategoryAuditSnapshot toAuditSnapshot(CategoryEntity entity);

    @Override
    default boolean supports(String entityName) {
        return "CATEGORY".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof CategoryEntity category)) {
            throw new IllegalArgumentException(
                    "Expected CategoryEntity but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(category);
    }
}

