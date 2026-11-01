package com.ims.mapper.expenses;

import com.ims.dtos.expenses.ExpenseCategoryRequestDTO;
import com.ims.dtos.expenses.ExpenseCategoryResponseDTO;
import com.ims.entity.ExpenseCategoryEntity;
import com.ims.mapper.audit.AuditMapper;

import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        uses = {
                AuditMapper.class
        }
)
public interface ExpenseCategoryMapper {

    // =====================================================
    // REQUEST DTO -> ENTITY
    // =====================================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "categoryCode", ignore = true)

    // BaseEntity audit fields
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    ExpenseCategoryEntity toEntity(
            ExpenseCategoryRequestDTO dto
    );


    // =====================================================
    // ENTITY -> RESPONSE DTO
    // =====================================================

    @Mapping(
            target = "audit",
            source = "."
    )
    ExpenseCategoryResponseDTO toResponseDTO(
            ExpenseCategoryEntity entity
    );


    // =====================================================
    // UPDATE ENTITY
    // =====================================================

    @BeanMapping(
            nullValuePropertyMappingStrategy =
                    NullValuePropertyMappingStrategy.IGNORE
    )
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "categoryCode", ignore = true)

    // BaseEntity audit fields
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(
            ExpenseCategoryRequestDTO dto,
            @MappingTarget ExpenseCategoryEntity entity
    );
}