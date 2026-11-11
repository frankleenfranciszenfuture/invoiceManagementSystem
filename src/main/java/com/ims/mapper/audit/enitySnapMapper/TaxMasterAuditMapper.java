package com.ims.mapper.audit.enitySnapMapper;


import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.TaxMasterAuditSnapshot;
import com.ims.entity.TaxMasterEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TaxMasterAuditMapper extends AuditSnapshotMapper {

    TaxMasterAuditSnapshot toAuditSnapshot(TaxMasterEntity entity);

    @Override
    default boolean supports(String entityName) {
        return "TAX_MASTER".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof TaxMasterEntity taxMaster)) {
            throw new IllegalArgumentException(
                    "Expected TaxMasterEntity but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(taxMaster);
    }
}