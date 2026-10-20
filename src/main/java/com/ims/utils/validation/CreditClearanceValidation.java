package com.ims.utils.validation;

import com.ims.entity.CreditClearanceEntity;
import com.ims.enums.Status;
import com.ims.exception.BadRequestException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.repository.CreditClearanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CreditClearanceValidation {

    private final CreditClearanceRepository creditClearanceRepository;

    // =====================================================
    // VALIDATE CREDIT CLEARANCE
    // =====================================================

    public CreditClearanceEntity validateCreditClearance(
            Long creditClearanceId
    ) {

        if (creditClearanceId == null) {
            throw new BadRequestException(
                    "Credit clearance id is required."
            );
        }

        return creditClearanceRepository
                .findByIdAndStatus(
                        creditClearanceId,
                        Status.ACTIVE
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Credit clearance not found."
                        )
                );
    }
}
