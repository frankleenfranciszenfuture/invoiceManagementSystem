package com.ims.mapper.address;


import com.ims.entity.AddressEntity;
import jakarta.mail.Address;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AddressMapper {

    AddressEntity toEntity(Address dto);

    AddressEntity toDTO(AddressEntity entity);
}
