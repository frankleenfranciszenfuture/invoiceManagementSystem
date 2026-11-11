package com.ims.mapper.audit.enitySnapMapper;


import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.BankAccountAuditSnapshot;
import com.ims.entity.BankAccount;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BankAccountAuditMapper extends AuditSnapshotMapper {

    BankAccountAuditSnapshot toAuditSnapshot(BankAccount entity);

    @Override
    default boolean supports(String entityName) {
        return "BANK_ACCOUNT".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof BankAccount bankAccount)) {
            throw new IllegalArgumentException(
                    "Expected BankAccount but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(bankAccount);
    }
}
