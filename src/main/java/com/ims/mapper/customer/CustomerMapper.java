package com.ims.mapper.customer;

import com.ims.dtos.customer.CustomerRequest;
import com.ims.dtos.customer.CustomerResponse;
import com.ims.entity.CustomerEntity;
import com.ims.mapper.address.AddressMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(
        componentModel = "spring",
        uses = AddressMapper.class
)
public interface CustomerMapper {

    CustomerEntity toEntity(CustomerRequest dto);

    @Mapping(target = "status", source = "status")
    CustomerResponse toDTO(CustomerEntity entity);

    @Mapping(target = "id", ignore = true)
    void updateEntity(CustomerRequest dto,
                      @MappingTarget CustomerEntity entity);


}