package com.ims.service.serviceInterface.party;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.party.clearance.CreditClearanceRequest;
import com.ims.dtos.party.clearance.CreditClearanceResponse;

import java.time.LocalDate;
import java.util.List;

public interface CreditClearanceService {

    // =====================================================
    // CREATE
    // =====================================================

    ApiResponse<CreditClearanceResponse> create(
            CreditClearanceRequest request
    );

    // =====================================================
    // UPDATE
    // =====================================================

    ApiResponse<CreditClearanceResponse> update(
            Long id,
            CreditClearanceRequest request
    );

    // =====================================================
    // GET BY ID
    // =====================================================

    ApiResponse<CreditClearanceResponse> getById(
            Long id
    );

    // =====================================================
    // GET BY PARTY
    // =====================================================

    ApiResponse<List<CreditClearanceResponse>> getByParty(
            Long partyId
    );

    // =====================================================
    // GET ALL
    // =====================================================

    ApiResponse<PageResponse<CreditClearanceResponse>> getAll(
            int page,
            int size
    );

    // =====================================================
    // GET BY PARTY - PAGED
    // =====================================================

    ApiResponse<PageResponse<CreditClearanceResponse>> getByPartyPaged(
            Long partyId,
            int page,
            int size
    );

    // =====================================================
    // GET BY DATE RANGE
    // =====================================================

    ApiResponse<List<CreditClearanceResponse>> getByDateRange(
            LocalDate fromDate,
            LocalDate toDate
    );

    // =====================================================
    // DELETE / REVERSE
    // =====================================================

    ApiResponse<Void> delete(
            Long id
    );
}