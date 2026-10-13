package com.ims.service.impl.salesPerson;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;

import com.ims.dtos.party.PartyResponse;
import com.ims.dtos.salesPerson.SalesPersonRequest;
import com.ims.dtos.salesPerson.SalesPersonResponse;


import com.ims.entity.SalesPersonEntity;

import com.ims.enums.SalesPersonType;
import com.ims.enums.Status;
import com.ims.mapper.salesPerson.SalesPersonMapper;

import com.ims.repository.SalesPersonRepository;
import com.ims.service.serviceInterface.salesPerson.SalesPersonService;
import com.ims.utils.base.BaseEntityUtil;

import com.ims.utils.specification.SalesPersonSpecification;
import com.ims.utils.validation.SalesPersonValidation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class SalesPersonServiceImpl implements SalesPersonService {


    private final SalesPersonRepository salesPersonRepository;

    private final SalesPersonMapper salesPersonMapper;

    private final SalesPersonValidation salesPersonValidation;

    private final BaseEntityUtil baseEntityUtil;


    //=====================================================
    // CREATE SalesPerson
    //=====================================================

    @Override
    public ApiResponse<SalesPersonResponse> createSalesPerson(
            SalesPersonRequest request) {

        // Validate request and duplicate fields
        salesPersonValidation.validateCreate(
                request
        );


        SalesPersonEntity salesPerson =
                salesPersonMapper.toEntity(
                        request
                );


        //=================================================
        // SalesPerson CODE
        //=================================================

        salesPerson.setSalesPersonCode(
                generateSalesPersonNumber(
                        request.getSalesPersonType()
                )
        );

        //=================================================
        // STATUS
        //=================================================

        if (request.getStatus() != null) {

            salesPerson.setStatus(
                    request.getStatus()
            );

        } else {

            salesPerson.setStatus(
                    Status.ACTIVE
            );
        }

        //=================================================
        // AUDIT
        //=================================================

        baseEntityUtil.prepareForCreate(
                salesPerson
        );


        SalesPersonEntity saved =
                salesPersonRepository.save(
                        salesPerson
                );


        return ApiResponse.success(
                salesPersonMapper.toResponse(
                        saved
                ),
                "SalesPerson created successfully."
        );
    }


    //=====================================================
    // UPDATE PARTY
    //=====================================================

    @Override
    public ApiResponse<SalesPersonResponse> updateSalesPerson(
            Long id,
            SalesPersonRequest request) {


        //=================================================
        // VALIDATION
        //=================================================

        salesPersonValidation.validateUpdate(
                id,
                request
        );


        SalesPersonEntity salesPerson =
                salesPersonValidation.validateSalesPerson(
                        id
                );


        //=================================================
        // UPDATE PARTY DETAILS
        //=================================================

        salesPersonMapper.updateEntity(
                request,
                salesPerson
        );


        //=================================================
        // AUDIT
        //=================================================

        baseEntityUtil.prepareForUpdate(
                salesPerson
        );


        SalesPersonEntity saved =
                salesPersonRepository.save(
                        salesPerson
                );


        return ApiResponse.success(
                salesPersonMapper.toResponse(
                        saved
                ),
                "SalesPerson updated successfully."
        );
    }


    //=====================================================
    // GET BY ID
    //=====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<SalesPersonResponse> getSalesPersonById(
            Long id) {


        SalesPersonEntity salesPerson =
                salesPersonValidation.validateSalesPerson(
                        id
                );


        return ApiResponse.success(
                salesPersonMapper.toResponse(
                        salesPerson
                ),
                "SalesPerson fetched successfully."
        );
    }


    //=====================================================
    // GET ALL
    //=====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<SalesPersonResponse>> getAllSalesPersons(
            String search,
            SalesPersonType salesPersonType,
            Status status,
            Pageable pageable) {


        //=================================================
        // BUILD SPECIFICATION
        //=================================================

        Specification<SalesPersonEntity> specification =
                SalesPersonSpecification.isActive()
                        .and(
                                SalesPersonSpecification.search(
                                        search
                                )
                        )
                        .and(
                                SalesPersonSpecification.hasSalesPersonType(
                                        salesPersonType
                                )
                        )
                        .and(
                                SalesPersonSpecification.hasStatus(
                                        status
                                )
                        );


        //=================================================
        // FETCH
        //=================================================

        Page<SalesPersonEntity> salesPersons =
                salesPersonRepository.findAll(
                        specification,
                        pageable
                );


        return ApiResponse.success(
                toPageResponse(
                        salesPersons
                ),
                "SalesPersons fetched successfully."
        );
    }


    //=====================================================
    // DELETE PARTY
    //=====================================================

    @Override
    @Transactional
    public ApiResponse<Void> deleteSalesPerson(
            Long id) {


        SalesPersonEntity salesPerson =
                salesPersonValidation.validateSalesPerson(
                        id
                );


        //=================================================
        // SOFT DELETE
        //=================================================

        salesPerson.setActive(
                false
        );


        baseEntityUtil.prepareForUpdate(
                salesPerson
        );


        salesPersonRepository.save(
                salesPerson
        );


        return ApiResponse.success(
                null,
                "SalesPerson deleted successfully."
        );
    }


    //=====================================================
    // PARTY NUMBER GENERATION
    //=====================================================

    @Override
    public String generateSalesPersonNumber(
            SalesPersonType salesPersonType) {


        String prefix =
                switch (salesPersonType) {

                    case EMPLOYEE -> "EMP";

                    case AGENT -> "AGT";

                    case COMMISSION_BASED -> "CMB";
                };


        String codePrefix =
                prefix
                        + "-"
                        + LocalDate.now().getYear()
                        + "-";


        Optional<SalesPersonEntity> latest =
                salesPersonRepository
                        .findTopBySalesPersonCodeStartingWithOrderByIdDesc(
                                codePrefix
                        );


        int nextNumber = 1;


        if (latest.isPresent()) {

            String lastSalesPersonCode =
                    latest.get()
                            .getSalesPersonCode();


            String sequence =
                    lastSalesPersonCode.substring(
                            codePrefix.length()
                    );


            nextNumber =
                    Integer.parseInt(
                            sequence
                    ) + 1;
        }


        return codePrefix
                + String.format(
                "%06d",
                nextNumber
        );
    }



    //=====================================================
    // EMPTY STRING -> NULL
    //=====================================================

    private String emptyToNull(
            String value) {

        return value == null ||
                value.isBlank()
                ? null
                : value.trim();
    }


    //=====================================================
    // PAGE RESPONSE
    //=====================================================

    private PageResponse<SalesPersonResponse> toPageResponse(
            Page<SalesPersonEntity> page) {


        return PageResponse
                .<SalesPersonResponse>builder()
                .content(
                        page.getContent()
                                .stream()
                                .map(
                                        salesPersonMapper::toResponse
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