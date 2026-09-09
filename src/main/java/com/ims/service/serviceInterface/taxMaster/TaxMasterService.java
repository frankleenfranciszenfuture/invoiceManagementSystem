package com.ims.service.serviceInterface.taxMaster;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.taxMaster.TaxMasterRequest;
import com.ims.dtos.taxMaster.TaxMasterResponse;
import com.ims.enums.Status;
import com.ims.enums.TaxType;
import org.springframework.data.domain.Pageable;

public interface TaxMasterService {

    // =====================================================
    // CREATE
    // =====================================================

    ApiResponse<TaxMasterResponse> create(
            TaxMasterRequest request
    );


    // =====================================================
    // UPDATE
    // =====================================================

    ApiResponse<TaxMasterResponse> update(
            Long id,
            TaxMasterRequest request
    );


    // =====================================================
    // GET BY ID
    // =====================================================

    ApiResponse<TaxMasterResponse> getById(
            Long id
    );


    // =====================================================
    // GET ALL
    // =====================================================

    ApiResponse<PageResponse<TaxMasterResponse>> getAll(
            String search,
            TaxType taxType,
            Status status,
            Pageable pageable
    );


    // =====================================================
    // DELETE
    // =====================================================

    ApiResponse<Void> delete(
            Long id
    );
}
