package com.ims.mapper.audit.enitySnapMapper;


import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.CustomerAuditSnapshot;
import com.ims.dtos.audit.enityAuditSnapShot.CustomerAddressAuditSnapshot;
import com.ims.entity.AddressEntity;
import com.ims.entity.CustomerEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CustomerAuditMapper extends AuditSnapshotMapper {

    CustomerAuditSnapshot toAuditSnapshot(CustomerEntity entity);

    CustomerAddressAuditSnapshot toAddressAuditSnapshot(
            AddressEntity address
    );

    @Override
    default boolean supports(String entityName) {
        return "CUSTOMER".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof CustomerEntity customer)) {
            throw new IllegalArgumentException(
                    "Expected CustomerEntity but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(customer);
    }
}
