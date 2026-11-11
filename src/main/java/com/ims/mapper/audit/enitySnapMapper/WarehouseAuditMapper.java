package com.ims.mapper.audit.enitySnapMapper;


import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.WarehouseAuditSnapshot;
import com.ims.entity.WarehouseEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface WarehouseAuditMapper extends AuditSnapshotMapper {

    WarehouseAuditSnapshot toAuditSnapshot(WarehouseEntity entity);

    @Override
    default boolean supports(String entityName) {
        return "WAREHOUSE".equalsIgnoreCase(entityName)
                || "WAREHOUSES".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (entity instanceof WarehouseEntity warehouse) {
            return toAuditSnapshot(warehouse);
        }

        return null;
    }
}
