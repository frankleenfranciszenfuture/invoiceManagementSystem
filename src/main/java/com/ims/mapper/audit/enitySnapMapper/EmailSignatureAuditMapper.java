
package com.ims.mapper.audit.enitySnapMapper;

import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.EmailSignatureAuditSnapshot;
import com.ims.entity.EmailSignatureEntity;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EmailSignatureAuditMapper extends AuditSnapshotMapper {

    @Mapping(
            target = "defaultForNewMessages",
            expression = "java(entity.isDefaultForNewMessages())"
    )
    @Mapping(
            target = "defaultForReplies",
            expression = "java(entity.isDefaultForReplies())"
    )
    EmailSignatureAuditSnapshot toAuditSnapshot(
            EmailSignatureEntity entity
    );

    @Override
    default boolean supports(String entityName) {
        return "EMAIL_SIGNATURE".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof EmailSignatureEntity emailSignature)) {
            throw new IllegalArgumentException(
                    "Expected EmailSignatureEntity but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(emailSignature);
    }
}
