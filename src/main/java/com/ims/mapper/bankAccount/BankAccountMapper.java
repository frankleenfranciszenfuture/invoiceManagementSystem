package com.ims.mapper.bankAccount;


import com.ims.dtos.bankAccount.BankAccountCreateRequest;
import com.ims.dtos.bankAccount.BankAccountResponse;
import com.ims.dtos.bankAccount.BankAccountUpdateRequest;
import com.ims.entity.BankAccount;
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
public interface BankAccountMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    BankAccount toEntity(
            BankAccountCreateRequest request
    );


    @Mapping(
            target = "audit",
            source = "."
    )
    BankAccountResponse toResponse(
            BankAccount entity
    );


    List<BankAccountResponse> toResponseList(
            List<BankAccount> entities
    );


    @BeanMapping(
            nullValuePropertyMappingStrategy =
                    NullValuePropertyMappingStrategy.IGNORE
    )
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(
            BankAccountUpdateRequest request,
            @MappingTarget BankAccount entity
    );
}




