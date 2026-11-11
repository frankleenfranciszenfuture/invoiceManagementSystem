package com.ims.mapper.audit.enitySnapMapper;

import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.SalesPersonAuditSnapshot;
import com.ims.entity.SalesPersonEntity;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SalesPersonAuditMapper extends AuditSnapshotMapper {

    SalesPersonAuditSnapshot toAuditSnapshot(
            SalesPersonEntity entity
    );

    @Override
    default boolean supports(String entityName) {
        return "SALES_PERSON".equalsIgnoreCase(entityName)
                || "SALES_PERSONS".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof SalesPersonEntity salesPerson)) {
            throw new IllegalArgumentException(
                    "Expected SalesPersonEntity but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(salesPerson);
    }
}

