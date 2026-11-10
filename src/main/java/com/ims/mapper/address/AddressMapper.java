
package com.ims.mapper.address;

import com.ims.dtos.address.Address;
import com.ims.entity.AddressEntity;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface AddressMapper {

    // CREATE ADDRESS
    @Mapping(target = "id", ignore = true)
    AddressEntity toEntity(Address dto);

    // ADDRESS RESPONSE
    Address toDTO(AddressEntity entity);

    // UPDATE EXISTING ADDRESS WITHOUT CHANGING ITS ID
    @Mapping(target = "id", ignore = true)
    void updateEntity(
            Address dto,
            @MappingTarget AddressEntity entity
    );
}
