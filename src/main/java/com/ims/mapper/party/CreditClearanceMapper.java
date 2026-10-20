package com.ims.mapper.party;


import com.ims.dtos.party.clearance.CreditClearanceResponse;
import com.ims.entity.CreditClearanceEntity;
import com.ims.mapper.audit.AuditMapper;
import org.mapstruct.*;

import java.math.BigDecimal;

@Mapper(
        componentModel = "spring",
        uses = {
                AuditMapper.class
        },
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface CreditClearanceMapper {

    @Mapping(target = "partyId", source = "party.id")
    @Mapping(target = "partyCode", source = "party.partyCode")
    @Mapping(target = "partyName", source = "party.companyName")
    @Mapping(target = "partyType", source = "party.partyType")
    @Mapping(target = "creditLimit", source = "creditLimit")

    @Mapping(target = "audit", source = ".")
    CreditClearanceResponse toResponse(
            CreditClearanceEntity entity
    );

    @AfterMapping
    default void calculateCreditDetails(
            CreditClearanceEntity entity,
            @MappingTarget CreditClearanceResponse response) {

        BigDecimal creditLimit = safe(entity.getCreditLimit());
        BigDecimal previousOutstanding =
                safe(entity.getPreviousOutstandingCredit());
        BigDecimal remainingOutstanding =
                safe(entity.getRemainingOutstandingCredit());

        response.setAvailableCreditBeforeClearance(
                creditLimit.subtract(previousOutstanding)
        );

        response.setAvailableCreditAfterClearance(
                creditLimit.subtract(remainingOutstanding)
        );
    }

    default BigDecimal safe(BigDecimal value) {
        return value == null
                ? BigDecimal.ZERO
                : value;
    }
}