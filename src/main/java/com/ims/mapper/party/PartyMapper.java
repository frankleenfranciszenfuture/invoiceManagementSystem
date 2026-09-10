package com.ims.mapper.party;

import com.ims.dtos.party.PartyAddressRequest;
import com.ims.dtos.party.PartyAddressResponse;
import com.ims.dtos.party.PartyRequest;
import com.ims.dtos.party.PartyResponse;
import com.ims.entity.PartyAddressEntity;
import com.ims.entity.PartyEntity;
import com.ims.mapper.audit.AuditMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {
                AuditMapper.class,
                PartyBankAccountMapper.class
        },
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface PartyMapper {

    //=====================================================
    // REQUEST -> ENTITY
    //=====================================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "partyCode", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "addresses", ignore = true)
    @Mapping(target = "bankAccounts", ignore = true)
    PartyEntity toEntity(
            PartyRequest request
    );


    //=====================================================
    // ENTITY -> RESPONSE
    //=====================================================

    @Mapping(target = "audit", source = ".")
    @Mapping(target = "addresses", source = "addresses")
    @Mapping(target = "bankAccounts", source = "bankAccounts")
    PartyResponse toResponse(
            PartyEntity entity
    );

    List<PartyResponse> toResponseList(
            List<PartyEntity> entities
    );


    //=====================================================
    // UPDATE ENTITY
    //=====================================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "partyCode", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "addresses", ignore = true)
    @Mapping(target = "bankAccounts", ignore = true)

    @Mapping(target = "active", ignore = true)

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(
            PartyRequest request,
            @MappingTarget PartyEntity entity
    );


    //=====================================================
    // ADDRESS REQUEST -> ENTITY
    //=====================================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "party", ignore = true)
    PartyAddressEntity toAddressEntity(
            PartyAddressRequest request
    );

    List<PartyAddressEntity> toAddressEntityList(
            List<PartyAddressRequest> requests
    );


    //=====================================================
    // ADDRESS ENTITY -> RESPONSE
    //=====================================================

    @Mapping(target = "audit", source = ".")
    PartyAddressResponse toAddressResponse(
            PartyAddressEntity entity
    );

    List<PartyAddressResponse> toAddressResponseList(
            List<PartyAddressEntity> entities
    );
}