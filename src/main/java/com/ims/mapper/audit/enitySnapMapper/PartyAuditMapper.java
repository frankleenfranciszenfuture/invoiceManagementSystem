
package com.ims.mapper.audit.enitySnapMapper;

import com.ims.common.audit.AuditSnapshotMapper;

import com.ims.dtos.audit.enityAuditSnapShot.PartyAuditSnapshot;
import com.ims.dtos.audit.enityAuditSnapShot.PartyAddressAuditSnapshot;
import com.ims.dtos.audit.enityAuditSnapShot.PartyBankAccountAuditSnapshot;

import com.ims.entity.PartyEntity;
import com.ims.entity.PartyAddressEntity;
import com.ims.entity.PartyBankAccountEntity;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PartyAuditMapper extends AuditSnapshotMapper {

    PartyAuditSnapshot toAuditSnapshot(PartyEntity entity);

    PartyAddressAuditSnapshot toAddressAuditSnapshot(
            PartyAddressEntity entity
    );

    PartyBankAccountAuditSnapshot toBankAccountAuditSnapshot(
            PartyBankAccountEntity entity
    );

    @Override
    default boolean supports(String entityName) {
        return "PARTY".equalsIgnoreCase(entityName)
                || "PARTIES".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof PartyEntity party)) {
            throw new IllegalArgumentException(
                    "Expected PartyEntity but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(party);
    }
}
