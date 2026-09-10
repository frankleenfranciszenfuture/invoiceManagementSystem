package com.ims.utils.validation;


import com.ims.dtos.party.PartyRequest;
import com.ims.entity.PartyEntity;
import com.ims.enums.PartyType;
import com.ims.exception.BadRequestException;
import com.ims.exception.DuplicateResourceException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.repository.PartyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PartyValidation {

    private final PartyRepository partyRepository;


    // =====================================================
    // VALIDATE PARTY
    // =====================================================

    public PartyEntity validateParty(
            Long partyId) {

        if (partyId == null) {
            throw new BadRequestException(
                    "Party id is required."
            );
        }

        return partyRepository
                .findByIdAndActiveTrue(partyId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Party not found."
                        )
                );
    }


    // =====================================================
    // CREATE VALIDATION
    // =====================================================

    public void validateCreate(
            PartyRequest request) {

        if (request == null) {
            throw new BadRequestException(
                    "Party request is required."
            );
        }

        validatePartyType(
                request.getPartyType()
        );


        // =================================================
        // EMAIL
        // =================================================

        String email = normalize(
                request.getEmail()
        );

        if (email != null &&
                partyRepository
                        .existsByEmailAndActiveTrue(
                                email
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
                partyRepository
                        .existsByMobileAndActiveTrue(
                                mobile
                        )) {

            throw new DuplicateResourceException(
                    "Mobile already exists."
            );
        }


        // =================================================
        // GST NUMBER
        // =================================================

        String gstNumber = normalize(
                request.getGstNumber()
        );

        if (gstNumber != null &&
                partyRepository
                        .existsByGstNumberAndActiveTrue(
                                gstNumber
                        )) {

            throw new DuplicateResourceException(
                    "GST Number already exists."
            );
        }


        // =================================================
        // PAN NUMBER
        // =================================================

        String panNumber = normalize(
                request.getPanNumber()
        );

        if (panNumber != null &&
                partyRepository
                        .existsByPanNumberAndActiveTrue(
                                panNumber
                        )) {

            throw new DuplicateResourceException(
                    "PAN Number already exists."
            );
        }
    }


    // =====================================================
    // UPDATE VALIDATION
    // =====================================================

    public void validateUpdate(
            Long partyId,
            PartyRequest request) {

        if (request == null) {
            throw new BadRequestException(
                    "Party request is required."
            );
        }

        validateParty(
                partyId
        );

        validatePartyType(
                request.getPartyType()
        );


        // =================================================
        // EMAIL
        // =================================================

        String email = normalize(
                request.getEmail()
        );

        if (email != null &&
                partyRepository
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
                partyRepository
                        .existsByMobileAndActiveTrueAndIdNot(
                                mobile,
                                partyId
                        )) {

            throw new DuplicateResourceException(
                    "Mobile already exists."
            );
        }


        // =================================================
        // GST NUMBER
        // =================================================

        String gstNumber = normalize(
                request.getGstNumber()
        );

        if (gstNumber != null &&
                partyRepository
                        .existsByGstNumberAndActiveTrueAndIdNot(
                                gstNumber,
                                partyId
                        )) {

            throw new DuplicateResourceException(
                    "GST Number already exists."
            );
        }


        // =================================================
        // PAN NUMBER
        // =================================================

        String panNumber = normalize(
                request.getPanNumber()
        );

        if (panNumber != null &&
                partyRepository
                        .existsByPanNumberAndActiveTrueAndIdNot(
                                panNumber,
                                partyId
                        )) {

            throw new DuplicateResourceException(
                    "PAN Number already exists."
            );
        }
    }


    // =====================================================
    // PARTY TYPE
    // =====================================================

    private void validatePartyType(
            PartyType type) {

        if (type == null) {

            throw new BadRequestException(
                    "Party type is required."
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