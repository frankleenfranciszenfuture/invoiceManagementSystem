package com.ims.mapper.taxMaster;

import com.ims.dtos.taxMaster.TaxMasterRequest;
import com.ims.dtos.taxMaster.TaxMasterResponse;
import com.ims.entity.TaxMasterEntity;
import com.ims.mapper.audit.AuditMapper;
import org.mapstruct.*;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = AuditMapper.class
)
public interface TaxMasterMapper {


    // =====================================================
    // REQUEST -> ENTITY
    // =====================================================

    @Mapping(target = "id", ignore = true)
    TaxMasterEntity toEntity(
            TaxMasterRequest request
    );


    // =====================================================
    // ENTITY -> RESPONSE
    // =====================================================

    @Mapping(target = "audit", source = ".")
    TaxMasterResponse toResponse(
            TaxMasterEntity entity
    );


    // =====================================================
    // LIST
    // =====================================================

    List<TaxMasterResponse> toResponseList(
            List<TaxMasterEntity> entities
    );


    // =====================================================
    // UPDATE
    // =====================================================

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
            TaxMasterRequest request,
            @MappingTarget TaxMasterEntity entity
    );

}