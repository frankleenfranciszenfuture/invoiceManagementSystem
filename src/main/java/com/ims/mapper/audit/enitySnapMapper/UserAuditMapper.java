package com.ims.mapper.audit.enitySnapMapper;

import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.UserAuditSnapshot;
import com.ims.entity.UserEntity;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserAuditMapper extends AuditSnapshotMapper {

    @Mapping(target = "role", source = "role.roleName")
    @Mapping(target = "accountVerified", source = "isAccountVerified")
    UserAuditSnapshot toAuditSnapshot(UserEntity entity);

    @Override
    default boolean supports(String entityName) {
        return "USER".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof UserEntity user)) {
            throw new IllegalArgumentException(
                    "Expected UserEntity but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(user);
    }
}