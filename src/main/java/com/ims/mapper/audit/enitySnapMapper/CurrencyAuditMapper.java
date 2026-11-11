package com.ims.mapper.audit.enitySnapMapper;

import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.CurrencyAuditSnapshot;
import com.ims.entity.Currency;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CurrencyAuditMapper extends AuditSnapshotMapper {

    CurrencyAuditSnapshot toAuditSnapshot(Currency entity);

    @Override
    default boolean supports(String entityName) {
        return "CURRENCY".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof Currency currency)) {
            throw new IllegalArgumentException(
                    "Expected Currency but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(currency);
    }
}
