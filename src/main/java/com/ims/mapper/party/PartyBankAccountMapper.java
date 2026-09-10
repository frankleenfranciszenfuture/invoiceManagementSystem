package com.ims.mapper.party;


import com.ims.dtos.party.PartyBankAccountRequest;
import com.ims.dtos.party.PartyBankAccountResponse;
import com.ims.entity.PartyBankAccountEntity;
import com.ims.mapper.audit.AuditMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {
                AuditMapper.class
        },
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface PartyBankAccountMapper {

    //=====================================================
    // REQUEST -> ENTITY
    //=====================================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "party", ignore = true)
    @Mapping(target = "status", ignore = true)
    PartyBankAccountEntity toEntity(
            PartyBankAccountRequest request
    );

    List<PartyBankAccountEntity> toEntityList(
            List<PartyBankAccountRequest> requests
    );

    //=====================================================
    // ENTITY -> RESPONSE
    //=====================================================

    @Mapping(target = "partyId", source = "party.id")
    @Mapping(target = "audit", source = ".")
    PartyBankAccountResponse toResponse(
            PartyBankAccountEntity entity
    );

    List<PartyBankAccountResponse> toResponseList(
            List<PartyBankAccountEntity> entities
    );

    //=====================================================
    // UPDATE ENTITY
    //=====================================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "party", ignore = true)
    @Mapping(target = "status", ignore = true)

    @Mapping(target = "active", ignore = true)

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(
            PartyBankAccountRequest request,
            @MappingTarget PartyBankAccountEntity entity
    );
}