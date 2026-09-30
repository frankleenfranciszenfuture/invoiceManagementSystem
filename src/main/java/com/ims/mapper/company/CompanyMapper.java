 package com.ims.mapper.company;

import com.ims.dtos.company.CompanyCreateRequest;
import com.ims.dtos.company.CompanyResponse;
import com.ims.dtos.company.CompanyUpdateRequest;
import com.ims.entity.CompanyDetails;
import com.ims.mapper.audit.AuditMapper;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {
                AuditMapper.class
        }
)
public interface CompanyMapper {

    // =====================================================
    // CREATE REQUEST -> ENTITY
    // =====================================================

    @Mapping(
            target = "id",
            ignore = true
    )
    @Mapping(
            target = "logo",
            ignore = true
    )
    @Mapping(
            target = "signature",
            ignore = true
    )
    @Mapping(
            target = "active",
            ignore = true
    )
    @Mapping(
            target = "createdAt",
            ignore = true
    )
    @Mapping(
            target = "updatedAt",
            ignore = true
    )
    @Mapping(
            target = "createdBy",
            ignore = true
    )
    @Mapping(
            target = "updatedBy",
            ignore = true
    )
    CompanyDetails toEntity(
            CompanyCreateRequest request
    );


    // =====================================================
    // ENTITY -> RESPONSE
    // =====================================================

    @Mapping(
            target = "audit",
            source = "."
    )
    CompanyResponse toResponse(
            CompanyDetails entity
    );


    // =====================================================
    // ENTITY LIST -> RESPONSE LIST
    // =====================================================

    List<CompanyResponse> toResponseList(
            List<CompanyDetails> entities
    );


    // =====================================================
    // UPDATE
    // =====================================================

    @BeanMapping(
            nullValuePropertyMappingStrategy =
                    NullValuePropertyMappingStrategy.IGNORE
    )
    @Mapping(
            target = "id",
            ignore = true
    )
    @Mapping(
            target = "logo",
            ignore = true
    )
    @Mapping(
            target = "signature",
            ignore = true
    )
    @Mapping(
            target = "createdAt",
            ignore = true
    )
    @Mapping(
            target = "updatedAt",
            ignore = true
    )
    @Mapping(
            target = "createdBy",
            ignore = true
    )
    @Mapping(
            target = "updatedBy",
            ignore = true
    )
    void updateEntity(
            CompanyUpdateRequest request,
            @MappingTarget CompanyDetails entity
    );
}
