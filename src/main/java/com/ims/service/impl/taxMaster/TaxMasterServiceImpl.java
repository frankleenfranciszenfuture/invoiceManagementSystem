package com.ims.service.impl.taxMaster;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.taxMaster.TaxMasterRequest;
import com.ims.dtos.taxMaster.TaxMasterResponse;
import com.ims.entity.TaxMasterEntity;
import com.ims.enums.Status;
import com.ims.enums.TaxType;
import com.ims.mapper.taxMaster.TaxMasterMapper;
import com.ims.repository.TaxMasterRepository;
import com.ims.service.serviceInterface.taxMaster.TaxMasterService;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.specification.TaxMasterSpecification;
import com.ims.utils.validation.TaxMasterValidation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TaxMasterServiceImpl implements TaxMasterService {

    private final TaxMasterRepository taxMasterRepository;
    private final TaxMasterMapper taxMasterMapper;
    private final TaxMasterValidation taxMasterValidation;
    private final BaseEntityUtil baseEntityUtil;

    // =====================================================
    // CREATE
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<TaxMasterResponse> create(
            TaxMasterRequest request) {

        log.info(
                "Creating Tax Master : {}",
                request.getTaxName()
        );

        taxMasterValidation.validateDuplicateName(
                request.getTaxName()
        );

        taxMasterValidation.validateTaxRates(
                request
        );

        TaxMasterEntity taxMaster =
                taxMasterMapper.toEntity(request);

        taxMaster.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : Status.ACTIVE
        );

        taxMaster.setActive(true);

        baseEntityUtil.prepareForCreate(
                taxMaster
        );

        TaxMasterEntity saved =
                taxMasterRepository.save(taxMaster);

        return ApiResponse.success(
                taxMasterMapper.toResponse(saved),
                "Tax master created successfully."
        );
    }

    // =====================================================
    // UPDATE
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<TaxMasterResponse> update(
            Long id,
            TaxMasterRequest request) {

        log.info(
                "Updating Tax Master : {}",
                id
        );

        TaxMasterEntity taxMaster =
                taxMasterValidation.validateTaxMaster(id);

        taxMasterValidation.validateDuplicateName(
                id,
                request.getTaxName()
        );

        taxMasterValidation.validateTaxRates(
                request
        );

        taxMasterMapper.updateEntity(
                request,
                taxMaster
        );

        if (request.getStatus() != null) {
            taxMaster.setStatus(
                    request.getStatus()
            );
        }

        baseEntityUtil.prepareForUpdate(
                taxMaster
        );

        TaxMasterEntity updated =
                taxMasterRepository.save(taxMaster);

        return ApiResponse.success(
                taxMasterMapper.toResponse(updated),
                "Tax master updated successfully."
        );
    }

    // =====================================================
    // GET BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<TaxMasterResponse> getById(
            Long id) {

        log.info(
                "Fetching Tax Master : {}",
                id
        );

        TaxMasterEntity taxMaster =
                taxMasterValidation.validateTaxMaster(id);

        return ApiResponse.success(
                taxMasterMapper.toResponse(taxMaster),
                "Tax master fetched successfully."
        );
    }

    // =====================================================
    // GET ALL
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<TaxMasterResponse>> getAll(
            String search,
            TaxType taxType,
            Status status,
            Pageable pageable) {

        log.info(
                "Fetching Tax Masters | search={}, taxType={}, status={}",
                search,
                taxType,
                status
        );

        Specification<TaxMasterEntity> specification =
                TaxMasterSpecification.containsKeyword(search)
                        .and(
                                TaxMasterSpecification.hasTaxType(taxType)
                        )
                        .and(
                                TaxMasterSpecification.hasStatus(status)
                        )
                        .and(
                                TaxMasterSpecification.isActive()
                        );

        // Default sorting: tax rate ASC
        Pageable sortedPageable = pageable;

        if (pageable.getSort().isUnsorted()) {

            sortedPageable = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by(
                            Sort.Direction.ASC,
                            "taxRate"
                    )
            );
        }

        Page<TaxMasterEntity> taxMasters =
                taxMasterRepository.findAll(
                        specification,
                        sortedPageable
                );

        return ApiResponse.success(
                toPageResponse(taxMasters),
                "Tax masters fetched successfully."
        );
    }

    // =====================================================
    // DELETE
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<Void> delete(
            Long id) {

        log.info(
                "Deleting Tax Master : {}",
                id
        );

        TaxMasterEntity taxMaster =
                taxMasterValidation.validateTaxMaster(id);

        taxMaster.setActive(false);

        baseEntityUtil.prepareForUpdate(
                taxMaster
        );

        taxMasterRepository.save(taxMaster);

        return ApiResponse.success(
                null,
                "Tax master deleted successfully."
        );
    }

    // =====================================================
    // PAGE RESPONSE
    // =====================================================

    private PageResponse<TaxMasterResponse> toPageResponse(
            Page<TaxMasterEntity> page) {

        return PageResponse.<TaxMasterResponse>builder()
                .content(
                        page.getContent()
                                .stream()
                                .map(taxMasterMapper::toResponse)
                                .toList()
                )
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}