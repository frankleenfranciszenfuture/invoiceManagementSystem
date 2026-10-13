package com.ims.utils.validation;

import com.ims.dtos.party.PartyRequest;
import com.ims.dtos.salesPerson.SalesPersonRequest;
import com.ims.entity.PartyEntity;
import com.ims.entity.SalesPersonEntity;
import com.ims.enums.PartyType;
import com.ims.exception.BadRequestException;
import com.ims.exception.DuplicateResourceException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.repository.PartyRepository;
import com.ims.repository.SalesPersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SalesPersonValidation {

    private final SalesPersonRepository salesPersonRepository;


    // =====================================================
    // VALIDATE PARTY
    // =====================================================

    public SalesPersonEntity validateSalesPerson(
            Long salesPersonId) {

        if (salesPersonId == null) {
            throw new BadRequestException(
                    "SalesPerson id is required."
            );
        }

        return salesPersonRepository
                .findByIdAndActiveTrue(salesPersonId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "SalesPerson not found."
                        )
                );
    }


    // =====================================================
    // CREATE VALIDATION
    // =====================================================

    public void validateCreate(
            SalesPersonRequest request) {

        if (request == null) {
            throw new BadRequestException(
                    "SalesPerson request is required."
            );
        }


        // =================================================
        // EMAIL
        // =================================================

        String email = normalize(
                request.getEmail()
        );

        if (email != null &&
                salesPersonRepository
                        .existsByEmailAndActiveTrue(
                                email
                        )) {

            throw new DuplicateResourceException(
                    "SalesPerson Email already exists."
            );
        }


        // =================================================
        // MOBILE
        // =================================================

        String mobile = normalize(
                request.getMobile()
        );

        if (mobile != null &&
                salesPersonRepository
                        .existsByMobileAndActiveTrue(
                                mobile
                        )) {

            throw new DuplicateResourceException(
                    "Mobile already exists."
            );
        }

    }


    // =====================================================
    // UPDATE VALIDATION
    // =====================================================

    public void validateUpdate(
            Long partyId,
            SalesPersonRequest request) {

        if (request == null) {
            throw new BadRequestException(
                    "SalesPerson request is required."
            );
        }

        // =================================================
        // EMAIL
        // =================================================

        String email = normalize(
                request.getEmail()
        );

        if (email != null &&
                salesPersonRepository
                        .existsByEmailAndActiveTrueAndIdNot(
                                email,
                                partyId
                        )) {

            throw new DuplicateResourceException(
                    "Email already exists."
            );
        }


        // =================================================
        // MOBILE
        // =================================================

        String mobile = normalize(
                request.getMobile()
        );

        if (mobile != null &&
                salesPersonRepository
                        .existsByMobileAndActiveTrueAndIdNot(
                                mobile,
                                partyId
                        )) {

            throw new DuplicateResourceException(
                    "Mobile already exists."
            );
        }

    }


    // =====================================================
    // NORMALIZE
    // =====================================================

    private String normalize(
            String value) {

        if (value == null ||
                value.isBlank()) {

            return null;
        }

        return value.trim();
    }
}