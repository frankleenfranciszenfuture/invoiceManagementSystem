package com.ims.mapper.audit.enitySnapMapper;
;

import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.UnitAuditSnapshot;
import com.ims.entity.UnitEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UnitAuditMapper extends AuditSnapshotMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.productName")
    UnitAuditSnapshot toAuditSnapshot(UnitEntity entity);

    @Override
    default boolean supports(String entityName) {
        return "UNIT".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof UnitEntity unit)) {
            throw new IllegalArgumentException(
                    "Expected UnitEntity but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(unit);
    }
}
