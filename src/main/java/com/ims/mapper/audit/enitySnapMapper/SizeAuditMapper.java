package com.ims.mapper.audit.enitySnapMapper;

import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.SizeAuditSnapshot;
import com.ims.entity.SizeEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SizeAuditMapper extends AuditSnapshotMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.productName")
    SizeAuditSnapshot toAuditSnapshot(SizeEntity entity);

    @Override
    default boolean supports(String entityName) {
        return "SIZE".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof SizeEntity size)) {
            throw new IllegalArgumentException(
                    "Expected SizeEntity but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(size);
    }
}