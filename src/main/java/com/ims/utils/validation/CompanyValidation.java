package com.ims.utils.validation;

import com.ims.dtos.company.CompanyCreateRequest;
import com.ims.dtos.company.CompanyUpdateRequest;
import com.ims.entity.CompanyDetails;
import com.ims.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class CompanyValidation {

    private final CompanyRepository companyRepository;


    // =====================================================
    // CREATE
    // =====================================================

    public void validateCreate(
            CompanyCreateRequest request
    ) {

        if (StringUtils.hasText(request.getCompanyCode())
                && companyRepository
                .existsByCompanyCodeIgnoreCaseAndActiveTrue(
                        request.getCompanyCode().trim()
                )) {

            throw new IllegalArgumentException(
                    "Company code already exists"
            );
        }


        if (StringUtils.hasText(request.getGstNumber())
                && companyRepository
                .existsByGstNumberIgnoreCaseAndActiveTrue(
                        request.getGstNumber().trim()
                )) {

            throw new IllegalArgumentException(
                    "GST number already exists"
            );
        }


        if (StringUtils.hasText(request.getPanNumber())
                && companyRepository
                .existsByPanNumberIgnoreCaseAndActiveTrue(
                        request.getPanNumber().trim()
                )) {

            throw new IllegalArgumentException(
                    "PAN number already exists"
            );
        }


        if (StringUtils.hasText(request.getPhone())
                && companyRepository
                .existsByPhoneAndActiveTrue(
                        request.getPhone().trim()
                )) {

            throw new IllegalArgumentException(
                    "Phone number already exists"
            );
        }
    }


    // =====================================================
    // UPDATE
    // =====================================================

    public void validateUpdate(
            Long id,
            CompanyUpdateRequest request
    ) {

        CompanyDetails existingCompany =
                companyRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Company not found"
                                )
                        );


        // -------------------------------------------------
        // COMPANY CODE
        // -------------------------------------------------

        if (StringUtils.hasText(request.getCompanyCode())
                && !sameIgnoreCase(
                existingCompany.getCompanyCode(),
                request.getCompanyCode()
        )
                && companyRepository
                .existsByCompanyCodeIgnoreCaseAndActiveTrueAndIdNot(
                        request.getCompanyCode().trim(),
                        id
                )) {

            throw new IllegalArgumentException(
                    "Company code already exists"
            );
        }


        // -------------------------------------------------
        // GST
        // -------------------------------------------------

        if (StringUtils.hasText(request.getGstNumber())
                && !sameIgnoreCase(
                existingCompany.getGstNumber(),
                request.getGstNumber()
        )
                && companyRepository
                .existsByGstNumberIgnoreCaseAndActiveTrueAndIdNot(
                        request.getGstNumber().trim(),
                        id
                )) {

            throw new IllegalArgumentException(
                    "GST number already exists"
            );
        }


        // -------------------------------------------------
        // PAN
        // -------------------------------------------------

        if (StringUtils.hasText(request.getPanNumber())
                && !sameIgnoreCase(
                existingCompany.getPanNumber(),
                request.getPanNumber()
        )
                && companyRepository
                .existsByPanNumberIgnoreCaseAndActiveTrueAndIdNot(
                        request.getPanNumber().trim(),
                        id
                )) {

            throw new IllegalArgumentException(
                    "PAN number already exists"
            );
        }


        // -------------------------------------------------
        // PHONE
        // -------------------------------------------------

        if (StringUtils.hasText(request.getPhone())
                && !same(
                existingCompany.getPhone(),
                request.getPhone()
        )
                && companyRepository
                .existsByPhoneAndActiveTrueAndIdNot(
                        request.getPhone().trim(),
                        id
                )) {

            throw new IllegalArgumentException(
                    "Phone number already exists"
            );
        }
    }


    // =====================================================
    // CASE-INSENSITIVE COMPARISON
    // =====================================================

    private boolean sameIgnoreCase(
            String existingValue,
            String requestedValue
    ) {

        if (existingValue == null
                && requestedValue == null) {

            return true;
        }

        if (existingValue == null
                || requestedValue == null) {

            return false;
        }

        return existingValue
                .trim()
                .equalsIgnoreCase(
                        requestedValue.trim()
                );
    }


    // =====================================================
    // NORMAL STRING COMPARISON
    // =====================================================

    private boolean same(
            String existingValue,
            String requestedValue
    ) {

        if (existingValue == null
                && requestedValue == null) {

            return true;
        }

        if (existingValue == null
                || requestedValue == null) {

            return false;
        }

        return existingValue
                .trim()
                .equals(
                        requestedValue.trim()
                );
    }
}