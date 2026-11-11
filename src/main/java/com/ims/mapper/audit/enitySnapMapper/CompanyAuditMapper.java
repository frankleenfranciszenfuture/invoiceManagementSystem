package com.ims.mapper.audit.enitySnapMapper;


import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.CompanyAuditSnapshot;
import com.ims.entity.CompanyDetails;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CompanyAuditMapper extends AuditSnapshotMapper {

    CompanyAuditSnapshot toAuditSnapshot(CompanyDetails entity);

    @Override
    default boolean supports(String entityName) {
        return "COMPANY".equalsIgnoreCase(entityName)
                || "COMPANY_DETAILS".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof CompanyDetails company)) {
            throw new IllegalArgumentException(
                    "Expected CompanyDetails but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(company);
    }
}
