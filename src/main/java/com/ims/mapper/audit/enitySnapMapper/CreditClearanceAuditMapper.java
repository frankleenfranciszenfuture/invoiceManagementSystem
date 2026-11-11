package com.ims.mapper.audit.enitySnapMapper;


import com.ims.common.audit.AuditSnapshotMapper;

import com.ims.dtos.audit.enityAuditSnapShot.CreditClearanceAuditSnapshot;

import com.ims.entity.CreditClearanceEntity;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CreditClearanceAuditMapper extends AuditSnapshotMapper {

    @Mapping(
            target = "partyId",
            source = "party.id"
    )
    @Mapping(
            target = "partyCode",
            source = "party.partyCode"
    )
    @Mapping(
            target = "partyName",
            source = "party.companyName"
    )
    @Mapping(
            target = "partyType",
            source = "partyType"
    )
    CreditClearanceAuditSnapshot toAuditSnapshot(
            CreditClearanceEntity entity
    );

    // =====================================================
    // ENTITY SUPPORT
    // =====================================================

    @Override
    default boolean supports(String entityName) {

        return "CREDIT_CLEARANCE".equalsIgnoreCase(entityName)
                || "CREDIT_CLEARANCES".equalsIgnoreCase(entityName);
    }

    // =====================================================
    // OBJECT TO SNAPSHOT
    // =====================================================

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof CreditClearanceEntity clearance)) {

            throw new IllegalArgumentException(
                    "Expected CreditClearanceEntity but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(clearance);
    }
}

