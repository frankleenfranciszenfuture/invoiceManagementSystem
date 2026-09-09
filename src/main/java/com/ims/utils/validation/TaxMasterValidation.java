package com.ims.utils.validation;

import com.ims.dtos.taxMaster.TaxMasterRequest;
import com.ims.entity.TaxMasterEntity;
import com.ims.exception.DuplicateResourceException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.exception.ValidationException;
import com.ims.repository.TaxMasterRepository;
import com.ims.service.serviceInterface.access.AccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class TaxMasterValidation {

    private final TaxMasterRepository taxMasterRepository;

    private final AccessService accessService;


    // =====================================================
    // VALIDATE TAX MASTER
    // =====================================================

    public TaxMasterEntity validateTaxMaster(
            Long taxMasterId) {

        if (taxMasterId == null) {
            throw new ResourceNotFoundException(
                    "Tax master is required."
            );
        }

        return taxMasterRepository
                .findByIdAndActiveTrue(
                        taxMasterId
                )
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Tax master not found."
                        )
                );
    }


    // =====================================================
    // DUPLICATE TAX NAME - CREATE
    // =====================================================

    public void validateDuplicateName(
            String taxName) {

        if (taxMasterRepository
                .existsByTaxNameIgnoreCaseAndActiveTrue(taxName)) {

            throw new DuplicateResourceException(
                    "Tax name already exists."
            );
        }
    }


    // =====================================================
    // DUPLICATE TAX NAME - UPDATE
    // =====================================================

    public void validateDuplicateName(
            Long id,
            String taxName) {

        taxMasterRepository
                .findByTaxNameIgnoreCaseAndActiveTrue(taxName)
                .ifPresent(tax -> {

                    if (!tax.getId().equals(id)) {
                        throw new DuplicateResourceException(
                                "Tax name already exists."
                        );
                    }
                });
    }


    // =====================================================
    // DUPLICATE TAX CODE - CREATE
    // =====================================================


    public void validateTaxRates(TaxMasterRequest request) {

        if (request == null) {
            throw new ValidationException(
                    "Tax master request is required."
            );
        }

        if (request.getTaxType() == null) {
            throw new ValidationException(
                    "Tax type is required."
            );
        }

        if (request.getTaxRate() == null) {
            throw new ValidationException(
                    "Tax rate is required."
            );
        }

        if (request.getTaxRate().compareTo(BigDecimal.ZERO) < 0) {
            throw new ValidationException(
                    "Tax rate cannot be negative."
            );
        }

        // -------------------------------------------------
        // GST RATE VALIDATION
        // -------------------------------------------------

        switch (request.getTaxType()) {

            case GST -> validateGstRates(request);

            case IGST -> validateIgstRates(request);

            case CGST_SGST -> validateCgstSgstRates(request);

            default -> throw new ValidationException(
                    "Unsupported tax type."
            );
        }
    }

    private void validateGstRates(
            TaxMasterRequest request) {

        if (request.getCgstRate() == null) {
            throw new ValidationException(
                    "CGST rate is required."
            );
        }

        if (request.getSgstRate() == null) {
            throw new ValidationException(
                    "SGST rate is required."
            );
        }

        if (request.getIgstRate() == null) {
            throw new ValidationException(
                    "IGST rate is required."
            );
        }

        validateNonNegative(request.getCgstRate(), "CGST rate");
        validateNonNegative(request.getSgstRate(), "SGST rate");
        validateNonNegative(request.getIgstRate(), "IGST rate");

        BigDecimal combinedRate =
                request.getCgstRate()
                        .add(request.getSgstRate());

        if (combinedRate.compareTo(request.getTaxRate()) != 0) {
            throw new ValidationException(
                    "CGST + SGST must equal total tax rate."
            );
        }

        if (request.getIgstRate()
                .compareTo(request.getTaxRate()) != 0) {

            throw new ValidationException(
                    "IGST must equal total tax rate."
            );
        }
    }

    private void validateNonNegative(
            BigDecimal value,
            String fieldName) {

        if (value == null) {
            throw new ValidationException(
                    fieldName + " is required."
            );
        }

        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new ValidationException(
                    fieldName + " cannot be negative."
            );
        }
    }

    private void validateIgstRates(
            TaxMasterRequest request) {

        // IGST is required
        if (request.getIgstRate() == null) {
            throw new ValidationException(
                    "IGST rate is required."
            );
        }

        // IGST cannot be negative
        validateNonNegative(
                request.getIgstRate(),
                "IGST rate"
        );

        // CGST should not be provided
        if (request.getCgstRate() != null
                && request.getCgstRate()
                .compareTo(BigDecimal.ZERO) != 0) {

            throw new ValidationException(
                    "CGST rate must be zero for IGST."
            );
        }

        // SGST should not be provided
        if (request.getSgstRate() != null
                && request.getSgstRate()
                .compareTo(BigDecimal.ZERO) != 0) {

            throw new ValidationException(
                    "SGST rate must be zero for IGST."
            );
        }

        // IGST must equal total tax rate
        if (request.getIgstRate()
                .compareTo(request.getTaxRate()) != 0) {

            throw new ValidationException(
                    "IGST rate must equal total tax rate."
            );
        }
    }

    private void validateCgstSgstRates(
            TaxMasterRequest request) {

        // CGST is required
        if (request.getCgstRate() == null) {
            throw new ValidationException(
                    "CGST rate is required."
            );
        }

        // SGST is required
        if (request.getSgstRate() == null) {
            throw new ValidationException(
                    "SGST rate is required."
            );
        }

        // CGST cannot be negative
        validateNonNegative(
                request.getCgstRate(),
                "CGST rate"
        );

        // SGST cannot be negative
        validateNonNegative(
                request.getSgstRate(),
                "SGST rate"
        );

        // IGST should not be provided
        if (request.getIgstRate() != null
                && request.getIgstRate()
                .compareTo(BigDecimal.ZERO) != 0) {

            throw new ValidationException(
                    "IGST rate must be zero for CGST + SGST."
            );
        }

        // CGST + SGST must equal total tax rate
        BigDecimal combinedRate =
                request.getCgstRate()
                        .add(request.getSgstRate());

        if (combinedRate.compareTo(
                request.getTaxRate()
        ) != 0) {

            throw new ValidationException(
                    "CGST + SGST must equal total tax rate."
            );
        }
    }
}
