package com.ims.mapper.customer;

import com.ims.dtos.customer.CustomerRequest;
import com.ims.dtos.customer.CustomerResponse;
import com.ims.entity.CustomerEntity;
import com.ims.mapper.address.AddressMapper;
import com.ims.mapper.audit.AuditMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        uses = {
                AddressMapper.class,
                AuditMapper .class,
        },
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface CustomerMapper {

    CustomerEntity toEntity(CustomerRequest dto);

    @Mapping(target = "status", source = "status")
    @Mapping(
            target = "audit",
            source = "."
    )
    CustomerResponse toDTO(CustomerEntity entity);

    @Mapping(target = "id", ignore = true)
    void updateEntity(CustomerRequest dto,
                      @MappingTarget CustomerEntity entity);


}