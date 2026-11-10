package com.ims.mapper.audit.enitySnapMapper;

import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.RoleAuditSnapshot;
import com.ims.entity.RoleEntity;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleAuditMapper extends AuditSnapshotMapper {

    RoleAuditSnapshot toAuditSnapshot(RoleEntity entity);

    @Override
    default boolean supports(String entityName) {
        return "ROLE".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof RoleEntity role)) {
            throw new IllegalArgumentException(
                    "Expected RoleEntity but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(role);
    }
}
