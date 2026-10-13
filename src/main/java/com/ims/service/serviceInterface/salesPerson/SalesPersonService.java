package com.ims.service.serviceInterface.salesPerson;



import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;

import com.ims.dtos.salesPerson.SalesPersonRequest;
import com.ims.dtos.salesPerson.SalesPersonResponse;
import com.ims.enums.PartyType;
import com.ims.enums.SalesPersonType;
import com.ims.enums.Status;
import org.springframework.data.domain.Pageable;

public interface SalesPersonService {



    //=====================================================
    // Create
    //=====================================================
    ApiResponse<SalesPersonResponse> createSalesPerson(
            SalesPersonRequest request
    );


    //=====================================================
    // Update
    //=====================================================

    ApiResponse<SalesPersonResponse> updateSalesPerson(
            Long id,
            SalesPersonRequest request
    );


    //=====================================================
    // GET PARTY BY ID
    //=====================================================

    ApiResponse<SalesPersonResponse> getSalesPersonById(
            Long id
    );


    //=====================================================
    // GET ALL PARTIES
    //=====================================================

    ApiResponse<PageResponse<SalesPersonResponse>> getAllSalesPersons(
            String search,
            SalesPersonType salesPersonType,
            Status status,
            Pageable pageable
    );


    //=====================================================
    // DELETE PARTY (Soft Delete)
    //=====================================================

    ApiResponse<Void> deleteSalesPerson(
            Long id
    );


    //=====================================================
    // PARTY NUMBER GENERATION
    //=====================================================

    String generateSalesPersonNumber(
            SalesPersonType salesPersonType
    );
}

