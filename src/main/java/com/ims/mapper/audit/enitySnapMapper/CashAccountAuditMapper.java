package com.ims.mapper.audit.enitySnapMapper;


import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.CashAccountAuditSnapshot;
import com.ims.entity.CashAccountEntity;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CashAccountAuditMapper extends AuditSnapshotMapper {

    CashAccountAuditSnapshot toAuditSnapshot(CashAccountEntity entity);

    @Override
    default boolean supports(String entityName) {
        return "CASH_ACCOUNT".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof CashAccountEntity cashAccount)) {
            throw new IllegalArgumentException(
                    "Expected CashAccountEntity but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(cashAccount);
    }
}

