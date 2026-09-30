 package com.ims.service.serviceInterface.company;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.company.CompanyCreateRequest;
import com.ims.dtos.company.CompanyResponse;
import com.ims.dtos.company.CompanySearchRequest;
import com.ims.dtos.company.CompanyUpdateRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface CompanyService {

    // =====================================================
    // CREATE
    // =====================================================

    ApiResponse<CompanyResponse> createCompany(
            CompanyCreateRequest request,
            MultipartFile logo,
            MultipartFile signature
    );


    // =====================================================
    // GET BY ID
    // =====================================================

    ApiResponse<CompanyResponse> getCompanyById(
            Long id
    );


    // =====================================================
    // GET ALL
    // =====================================================

    ApiResponse<PageResponse<CompanyResponse>> getAllCompanies(
            CompanySearchRequest request,
            Pageable pageable
    );


    // =====================================================
    // UPDATE
    // =====================================================

    ApiResponse<CompanyResponse> updateCompany(
            Long id,
            CompanyUpdateRequest request,
            MultipartFile logo,
            MultipartFile signature
    );


    // =====================================================
    // DELETE
    // =====================================================

    ApiResponse<Void> deleteCompany(
            Long id
    );

}
