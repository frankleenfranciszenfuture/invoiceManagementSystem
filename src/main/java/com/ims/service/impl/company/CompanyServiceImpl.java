package com.ims.service.impl.company;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.company.CompanyCreateRequest;
import com.ims.dtos.company.CompanyResponse;
import com.ims.dtos.company.CompanySearchRequest;
import com.ims.dtos.company.CompanyUpdateRequest;
import com.ims.entity.CompanyDetails;
import com.ims.mapper.company.CompanyMapper;
import com.ims.repository.CompanyRepository;
import com.ims.service.serviceInterface.company.CompanyService;
import com.ims.service.serviceInterface.fileStorage.FileStorageService;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.specification.CompanySpecification;
import com.ims.utils.validation.CompanyValidation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;
    private final CompanyValidation companyValidation;
    private final FileStorageService fileStorageService;

    private final BaseEntityUtil baseEntityUtil;
    // =====================================================
    // CREATE COMPANY
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<CompanyResponse> createCompany(
            CompanyCreateRequest request,
            MultipartFile logo,
            MultipartFile signature
    ) {

        log.info(
                "Creating Company : {}",
                request.getCompanyName()
        );

        // =================================================
        // 1. VALIDATE REQUEST
        // =================================================

        companyValidation.validateCreate(request);

        // =================================================
        // 2. CREATE ENTITY
        // =================================================

        CompanyDetails company =
                new CompanyDetails();

        // =================================================
        // 3. BASIC DETAILS
        // =================================================

        company.setCompanyName(
                request.getCompanyName()
        );

        company.setDisplayName(
                request.getDisplayName()
        );

        company.setLegalName(
                request.getLegalName()
        );

        company.setCompanyCode(
                request.getCompanyCode()
        );

        // =================================================
        // 4. TAX DETAILS
        // =================================================

        company.setGstNumber(
                request.getGstNumber()
        );

        company.setPanNumber(
                request.getPanNumber()
        );

        company.setTanNumber(
                request.getTanNumber()
        );

        // =================================================
        // 5. CONTACT DETAILS
        // =================================================

        company.setEmail(
                request.getEmail()
        );

        company.setPhone(
                request.getPhone()
        );

        company.setAlternatePhone(
                request.getAlternatePhone()
        );

        company.setWebsite(
                request.getWebsite()
        );

        // =================================================
        // 6. ADDRESS
        // =================================================

        company.setAddressLine1(
                request.getAddressLine1()
        );

        company.setAddressLine2(
                request.getAddressLine2()
        );

        company.setCity(
                request.getCity()
        );

        company.setState(
                request.getState()
        );

        company.setCountry(
                request.getCountry()
        );

        company.setPincode(
                request.getPincode()
        );

        // =================================================
        // 7. INVOICE SETTINGS
        // =================================================

        company.setInvoicePrefix(
                request.getInvoicePrefix()
        );

        company.setInvoiceStartNumber(
                request.getInvoiceStartNumber()
        );

        company.setCurrency(
                request.getCurrency()
        );

        company.setFinancialYearStart(
                request.getFinancialYearStart()
        );

        // =================================================
        // 8. STATUS
        // =================================================

        company.setStatus(
                request.getStatus()
        );

        company.setActive(
                true
        );

        // =================================================
        // 9. LOGO
        // =================================================

        uploadLogo(
                company,
                logo
        );

        // =================================================
        // 10. SIGNATURE
        // =================================================

        uploadSignature(
                company,
                signature
        );

        baseEntityUtil.prepareForCreate(company);

        // =================================================
        // 11. SAVE
        // =================================================

        CompanyDetails savedCompany =
                companyRepository.save(
                        company
                );

        // =================================================
        // 12. RESPONSE
        // =================================================

        CompanyResponse response =
                mapCompanyResponse(
                        savedCompany
                );

        return ApiResponse.success(
                response,
                "Company created successfully."
        );
    }


    // =====================================================
    // GET COMPANY BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CompanyResponse> getCompanyById(
            Long id
    ) {

        CompanyDetails company =
                companyRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Company not found."
                                )
                        );

        if (!Boolean.TRUE.equals(
                company.getActive()
        )) {

            throw new RuntimeException(
                    "Company is inactive."
            );
        }

        return ApiResponse.success(
                mapCompanyResponse(company),
                "Company fetched successfully."
        );
    }


    // =====================================================
    // GET ALL COMPANIES
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<CompanyResponse>> getAllCompanies(
            CompanySearchRequest request,
            Pageable pageable
    ) {

        Specification<CompanyDetails> specification =
                CompanySpecification.filter(
                        request
                );

        Page<CompanyDetails> companies =
                companyRepository.findAll(
                        specification,
                        pageable
                );

        return ApiResponse.success(
                toPageResponse(companies),
                "Companies fetched successfully."
        );
    }


    // =====================================================
    // UPDATE COMPANY
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<CompanyResponse> updateCompany(
            Long id,
            CompanyUpdateRequest request,
            MultipartFile logo,
            MultipartFile signature
    ) {

        log.info(
                "Updating Company : {}",
                id
        );

        // =================================================
        // 1. VALIDATE COMPANY
        // =================================================

        CompanyDetails company =
                companyRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Company not found."
                                )
                        );

        // =================================================
        // 2. VALIDATE REQUEST
        // =================================================

        companyValidation.validateUpdate(
                id,
                request
        );

        // =================================================
        // 3. BASIC DETAILS
        // =================================================

        company.setCompanyName(
                request.getCompanyName()
        );

        company.setDisplayName(
                request.getDisplayName()
        );

        company.setLegalName(
                request.getLegalName()
        );

        company.setCompanyCode(
                request.getCompanyCode()
        );

        // =================================================
        // 4. TAX DETAILS
        // =================================================

        company.setGstNumber(
                request.getGstNumber()
        );

        company.setPanNumber(
                request.getPanNumber()
        );

        company.setTanNumber(
                request.getTanNumber()
        );

        // =================================================
        // 5. CONTACT DETAILS
        // =================================================

        company.setEmail(
                request.getEmail()
        );

        company.setPhone(
                request.getPhone()
        );

        company.setAlternatePhone(
                request.getAlternatePhone()
        );

        company.setWebsite(
                request.getWebsite()
        );

        // =================================================
        // 6. ADDRESS
        // =================================================

        company.setAddressLine1(
                request.getAddressLine1()
        );

        company.setAddressLine2(
                request.getAddressLine2()
        );

        company.setCity(
                request.getCity()
        );

        company.setState(
                request.getState()
        );

        company.setCountry(
                request.getCountry()
        );

        company.setPincode(
                request.getPincode()
        );

        // =================================================
        // 7. INVOICE SETTINGS
        // =================================================

        company.setInvoicePrefix(
                request.getInvoicePrefix()
        );

        company.setInvoiceStartNumber(
                request.getInvoiceStartNumber()
        );

        company.setCurrency(
                request.getCurrency()
        );

        company.setFinancialYearStart(
                request.getFinancialYearStart()
        );

        // =================================================
        // 8. STATUS
        // =================================================

        company.setStatus(
                request.getStatus()
        );

        company.setActive(
                request.getActive()
        );

        // =================================================
        // 9. LOGO
        // =================================================

        uploadLogo(
                company,
                logo
        );

        // =================================================
        // 10. SIGNATURE
        // =================================================

        uploadSignature(
                company,
                signature
        );

        baseEntityUtil.prepareForCreate(company);

        // =================================================
        // 11. SAVE
        // =================================================

        CompanyDetails updatedCompany =
                companyRepository.save(
                        company
                );

        // =================================================
        // 12. RESPONSE
        // =================================================

        CompanyResponse response =
                mapCompanyResponse(
                        updatedCompany
                );

        return ApiResponse.success(
                response,
                "Company updated successfully."
        );
    }


    // =====================================================
    // DELETE COMPANY
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<Void> deleteCompany(
            Long id
    ) {

        log.info(
                "Deleting Company : {}",
                id
        );

        CompanyDetails company =
                companyRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Company not found."
                                )
                        );

        company.setActive(
                false
        );

        companyRepository.save(
                company
        );

        return ApiResponse.success(
                null,
                "Company deleted successfully."
        );
    }


    // =====================================================
    // UPLOAD LOGO
    // =====================================================

    private void uploadLogo(
            CompanyDetails company,
            MultipartFile logo
    ) {

        if (logo == null || logo.isEmpty()) {

            log.warn(
                    "No company logo received."
            );

            return;
        }

        log.info(
                "Company logo received: name={}, size={}, contentType={}",
                logo.getOriginalFilename(),
                logo.getSize(),
                logo.getContentType()
        );

        if (company.getLogo() != null
                && !company.getLogo().isBlank()) {

            fileStorageService.delete(
                    company.getLogo()
            );
        }

        String uploadedLogoPath =
                fileStorageService.upload(
                        logo,
                        "companies/logo"
                );

        company.setLogo(
                uploadedLogoPath
        );
    }


    // =====================================================
    // UPLOAD SIGNATURE
    // =====================================================

    private void uploadSignature(
            CompanyDetails company,
            MultipartFile signature
    ) {

        if (signature == null || signature.isEmpty()) {

            log.warn(
                    "No company signature received."
            );

            return;
        }

        log.info(
                "Company signature received: name={}, size={}, contentType={}",
                signature.getOriginalFilename(),
                signature.getSize(),
                signature.getContentType()
        );

        if (company.getSignature() != null
                && !company.getSignature().isBlank()) {

            fileStorageService.delete(
                    company.getSignature()
            );
        }

        String uploadedSignaturePath =
                fileStorageService.upload(
                        signature,
                        "companies/signature"
                );

        company.setSignature(
                uploadedSignaturePath
        );
    }


    // =====================================================
    // MAP RESPONSE
    // =====================================================

    private CompanyResponse mapCompanyResponse(
            CompanyDetails company
    ) {

        CompanyResponse response =
                companyMapper.toResponse(
                        company
                );

        // =================================================
        // LOGO URL
        // =================================================

        String logoPath =
                response.getLogo();

        if (logoPath != null
                && !logoPath.isBlank()) {

            response.setLogo(
                    fileStorageService.getFileUrl(
                            logoPath
                    )
            );
        }

        // =================================================
        // SIGNATURE URL
        // =================================================

        String signaturePath =
                response.getSignature();

        if (signaturePath != null
                && !signaturePath.isBlank()) {

            response.setSignature(
                    fileStorageService.getFileUrl(
                            signaturePath
                    )
            );
        }

        return response;
    }


    // =====================================================
    // PAGE RESPONSE
    // =====================================================

    private PageResponse<CompanyResponse> toPageResponse(
            Page<CompanyDetails> page
    ) {

        return PageResponse.<CompanyResponse>builder()
                .content(
                        page.getContent()
                                .stream()
                                .map(
                                        this::mapCompanyResponse
                                )
                                .toList()
                )
                .pageNumber(
                        page.getNumber()
                )
                .pageSize(
                        page.getSize()
                )
                .totalElements(
                        page.getTotalElements()
                )
                .totalPages(
                        page.getTotalPages()
                )
                .last(
                        page.isLast()
                )
                .build();
    }
}