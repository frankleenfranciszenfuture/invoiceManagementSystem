package com.ims.mapper.salesPerson;


import com.ims.dtos.party.PartyAddressRequest;
import com.ims.dtos.party.PartyAddressResponse;
import com.ims.dtos.party.PartyRequest;
import com.ims.dtos.party.PartyResponse;
import com.ims.dtos.role.RoleRequest;
import com.ims.dtos.role.RoleResponse;
import com.ims.dtos.salesPerson.SalesPersonRequest;
import com.ims.dtos.salesPerson.SalesPersonResponse;
import com.ims.entity.PartyAddressEntity;
import com.ims.entity.PartyEntity;
import com.ims.entity.RoleEntity;
import com.ims.entity.SalesPersonEntity;
import com.ims.mapper.audit.AuditMapper;
import com.ims.mapper.party.PartyBankAccountMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {
                AuditMapper.class,
        },
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface SalesPersonMapper {

    //=====================================================
    // REQUEST -> ENTITY
    //=====================================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "salesPersonCode", ignore = true)
    @Mapping(target = "status", ignore = true)
    SalesPersonEntity toEntity(
            SalesPersonRequest request
    );


    //=====================================================
    // ENTITY -> RESPONSE
    //=====================================================

    @Mapping(target = "audit", source = ".")
    SalesPersonResponse toResponse(
            SalesPersonEntity entity
    );

    List<SalesPersonResponse> toResponse(
            List<SalesPersonEntity> entities
    );


    //=====================================================
    // UPDATE ENTITY
    //=====================================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "salesPersonCode", ignore = true)
    @Mapping(target = "status", ignore = true)

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(
            SalesPersonRequest request,
            @MappingTarget SalesPersonEntity entity
    );


}