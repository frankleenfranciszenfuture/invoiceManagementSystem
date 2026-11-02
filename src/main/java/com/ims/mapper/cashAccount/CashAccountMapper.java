package com.ims.mapper.cashAccount;


import com.ims.dtos.cashAccount.CashAccountRequestDTO;
import com.ims.dtos.cashAccount.CashAccountResponseDTO;
import com.ims.entity.CashAccountEntity;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface CashAccountMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "currentBalance", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    CashAccountEntity toEntity(CashAccountRequestDTO request);

    @Mapping(target = "audit.createdAt", source = "createdAt")
    @Mapping(target = "audit.updatedAt", source = "updatedAt")
    @Mapping(target = "audit.createdBy", source = "createdBy")
    @Mapping(target = "audit.updatedBy", source = "updatedBy")
    CashAccountResponseDTO toResponse(CashAccountEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "currentBalance", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(
            CashAccountRequestDTO request,
            @MappingTarget CashAccountEntity entity
    );
}