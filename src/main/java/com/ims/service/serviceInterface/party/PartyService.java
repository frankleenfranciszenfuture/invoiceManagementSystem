package com.ims.service.serviceInterface.party;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.party.PartyRequest;
import com.ims.dtos.party.PartyResponse;
import com.ims.enums.PartyType;
import com.ims.enums.Status;
import org.springframework.data.domain.Pageable;

public interface PartyService {

    //=====================================================
    // CREATE PARTY
    // Includes:
    // - Party Details
    // - Addresses
    // - Bank Accounts
    //=====================================================

    ApiResponse<PartyResponse> createParty(
            PartyRequest request
    );


    //=====================================================
    // UPDATE PARTY
    // Includes:
    // - Party Details
    // - Replace Addresses
    // - Replace Bank Accounts
    //=====================================================

    ApiResponse<PartyResponse> updateParty(
            Long id,
            PartyRequest request
    );


    //=====================================================
    // GET PARTY BY ID
    //=====================================================

    ApiResponse<PartyResponse> getPartyById(
            Long id
    );


    //=====================================================
    // GET ALL PARTIES
    //=====================================================

    ApiResponse<PageResponse<PartyResponse>> getAllParties(
            String search,
            PartyType partyType,
            Status status,
            Pageable pageable
    );


    //=====================================================
    // DELETE PARTY (Soft Delete)
    //=====================================================

    ApiResponse<Void> deleteParty(
            Long id
    );


    //=====================================================
    // PARTY NUMBER GENERATION
    //=====================================================

    String generatePartyNumber(
            PartyType partyType
    );
}
