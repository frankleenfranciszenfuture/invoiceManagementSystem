package com.ims.mapper.payment;


import com.ims.dtos.payment.PaymentResponseDTO;
import com.ims.entity.PaymentEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "audit.createdAt", source = "createdAt")
    @Mapping(target = "audit.updatedAt", source = "updatedAt")
    @Mapping(target = "audit.createdBy", source = "createdBy")
    @Mapping(target = "audit.updatedBy", source = "updatedBy")
    @Mapping(target = "audit.active", source = "active")

    @Mapping(target = "currencyId", source = "currency.id")
    @Mapping(target = "currencyName", source = "currency.currencyName")

    @Mapping(target = "bankAccountId", source = "bankAccount.id")
    @Mapping(target = "bankAccountName", source = "bankAccount.accountName")

    @Mapping(target = "cashAccountId", source = "cashAccount.id")
    @Mapping(target = "cashAccountName", source = "cashAccount.accountName")

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer.displayName")

    @Mapping(target = "partyId", source = "party.id")
    @Mapping(target = "partyName", source = "party.companyName")

    PaymentResponseDTO toResponse(PaymentEntity entity);
}
