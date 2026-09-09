package com.ims.mapper.units;

import com.ims.dtos.units.UnitRequest;
import com.ims.dtos.units.UnitResponse;
import com.ims.entity.UnitEntity;
import com.ims.mapper.audit.AuditMapper;
import org.mapstruct.*;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = AuditMapper.class
)
public interface UnitMapper {


    //=====================================================
    // ENTITY CREATE
    //=====================================================

    @Mapping(target = "id", ignore = true)
    UnitEntity toEntity(
            UnitRequest request
    );


    //=====================================================
    // RESPONSE
    //=====================================================

    @Mapping(target = "audit", source = ".")
    UnitResponse toResponse(
            UnitEntity entity
    );


    //=====================================================
    // LIST RESPONSE
    //=====================================================

    List<UnitResponse> toResponseList(
            List<UnitEntity> entities
    );


    //=====================================================
    // UPDATE
    //=====================================================

    @BeanMapping(
            nullValuePropertyMappingStrategy =
                    NullValuePropertyMappingStrategy.IGNORE
    )
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "active", ignore = true)
    void updateEntity(
            UnitRequest request,
            @MappingTarget UnitEntity entity
    );

}