package com.ims.service.impl.sizes;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.sizes.SizeRequest;
import com.ims.dtos.sizes.SizeResponse;
import com.ims.entity.SizeEntity;
import com.ims.enums.Status;
import com.ims.mapper.sizes.SizeMapper;
import com.ims.repository.SizeRepository;
import com.ims.service.serviceInterface.sizes.SizeCodeGeneratorService;
import com.ims.service.serviceInterface.sizes.SizeService;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.specification.SizeSpecification;
import com.ims.utils.validation.SizeValidation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class SizeServiceImpl implements SizeService {

    private final SizeRepository sizeRepository;

    private final SizeMapper sizeMapper;

    private final SizeValidation sizeValidation;

    private final BaseEntityUtil baseEntityUtil;

    private final SizeCodeGeneratorService sizeCodeGenerator;


    // =====================================================
    // CREATE
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<SizeResponse> create(
            SizeRequest request) {

        log.info(
                "Creating Size : {}",
                request.getSizeName()
        );

        // =====================================================
        // VALIDATION
        // =====================================================

        sizeValidation.validateDuplicateName(
                request.getSizeName()
        );

        sizeValidation.validateDuplicateShortName(
                request.getSizeShortName()
        );

        // Size code is generated automatically,
        // so no duplicate code validation is required here.


        // =====================================================
        // REQUEST → ENTITY
        // =====================================================

        SizeEntity size =
                sizeMapper.toEntity(request);


        // =====================================================
        // DEFAULT STATUS
        // =====================================================

        size.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : Status.ACTIVE
        );


        // =====================================================
        // PREPARE CREATE
        // =====================================================

        baseEntityUtil.prepareForCreate(size);


        // =====================================================
        // FIRST SAVE
        // Generates ID
        // =====================================================

        SizeEntity saved =
                sizeRepository.save(size);


        // =====================================================
        // GENERATE SIZE CODE
        // =====================================================

        saved.setSizeCode(
                sizeCodeGenerator.generate(
                        saved.getId(),
                        saved.getSizeName()
                )
        );


        // =====================================================
        // SECOND SAVE
        // Stores generated code
        // =====================================================

        SizeEntity updated =
                sizeRepository.save(saved);


        return ApiResponse.success(
                sizeMapper.toResponse(updated),
                "Size created successfully."
        );
    }


    // =====================================================
    // UPDATE
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<SizeResponse> update(
            Long id,
            SizeRequest request) {

        log.info(
                "Updating Size : {}",
                id
        );


        // =====================================================
        // VALIDATE EXISTING SIZE
        // =====================================================

        SizeEntity size =
                sizeValidation.validateSize(id);


        // =====================================================
        // DUPLICATE VALIDATION
        // Exclude current record
        // =====================================================

        sizeValidation.validateDuplicateName(
                id,
                request.getSizeName()
        );

        sizeValidation.validateDuplicateShortName(
                id,
                request.getSizeShortName()
        );


        // =====================================================
        // UPDATE ENTITY
        // =====================================================

        sizeMapper.updateEntity(
                request,
                size
        );


        // =====================================================
        // PREPARE UPDATE
        // =====================================================

        baseEntityUtil.prepareForUpdate(size);


        // =====================================================
        // SAVE
        // =====================================================

        SizeEntity updated =
                sizeRepository.save(size);


        return ApiResponse.success(
                sizeMapper.toResponse(updated),
                "Size updated successfully."
        );
    }


    // =====================================================
    // GET BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<SizeResponse> getById(
            Long id) {

        log.info(
                "Fetching Size : {}",
                id
        );


        SizeEntity size =
                sizeValidation.validateSize(id);


        return ApiResponse.success(
                sizeMapper.toResponse(size),
                "Size fetched successfully."
        );
    }


    // =====================================================
    // GET ALL
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<SizeResponse>> getAll(
            String search,
            Status status,
            Pageable pageable) {

        log.info(
                "Fetching Sizes | search={}, status={}",
                search,
                status
        );


        // =====================================================
        // DEFAULT STATUS
        // =====================================================

        if (status == null) {
            status = Status.ACTIVE;
        }


        // =====================================================
        // SPECIFICATION
        // =====================================================

        Specification<SizeEntity> specification =
                SizeSpecification
                        .containsKeyword(search)
                        .and(
                                SizeSpecification.hasStatus(status)
                        );


        // =====================================================
        // FETCH
        // =====================================================

        Page<SizeEntity> sizes =
                sizeRepository.findAll(
                        specification,
                        pageable
                );


        return ApiResponse.success(
                toPageResponse(sizes),
                "Sizes fetched successfully."
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
                "Deleting Size : {}",
                id
        );


        // =====================================================
        // VALIDATE SIZE
        // =====================================================

        SizeEntity size =
                sizeValidation.validateSize(id);


        // =====================================================
        // SOFT DELETE
        // =====================================================

        size.setActive(false);


        baseEntityUtil.prepareForUpdate(
                size
        );


        sizeRepository.save(size);


        return ApiResponse.success(
                null,
                "Size deleted successfully."
        );
    }


    // =====================================================
    // PAGE RESPONSE
    // =====================================================

    private PageResponse<SizeResponse> toPageResponse(
            Page<SizeEntity> page) {

        return PageResponse.<SizeResponse>builder()
                .content(
                        page.getContent()
                                .stream()
                                .map(sizeMapper::toResponse)
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