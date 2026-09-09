package com.ims.service.impl.units;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.units.UnitRequest;
import com.ims.dtos.units.UnitResponse;
import com.ims.entity.UnitEntity;
import com.ims.enums.Status;
import com.ims.mapper.units.UnitMapper;
import com.ims.repository.UnitRepository;
import com.ims.service.serviceInterface.units.UnitCodeGeneratorService;
import com.ims.service.serviceInterface.units.UnitService;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.specification.UnitSpecification;
import com.ims.utils.validation.UnitValidation;
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
public class UnitServiceImpl implements UnitService {

    private final UnitRepository unitRepository;
    private final UnitMapper unitMapper;
    private final UnitValidation unitValidation;
    private final BaseEntityUtil baseEntityUtil;
    private final UnitCodeGeneratorService unitCodeGeneratorService;


    // =====================================================
    // CREATE UNIT
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<UnitResponse> create(
            UnitRequest request) {

        log.info(
                "Creating Unit : {}",
                request.getUnitName()
        );

        // =====================================================
        // VALIDATE DUPLICATE NAME
        // =====================================================

        unitValidation.validateDuplicateName(
                request.getUnitName()
        );

        // =====================================================
        // MAP REQUEST
        // =====================================================

        UnitEntity unit =
                unitMapper.toEntity(request);

        // =====================================================
        // STATUS
        // =====================================================

        unit.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : Status.ACTIVE
        );

        // =====================================================
        // AUDIT FIELDS
        // =====================================================

        baseEntityUtil.prepareForCreate(unit);

        // =====================================================
        // FIRST SAVE
        // Generates database ID
        // =====================================================

        UnitEntity saved =
                unitRepository.save(unit);

        // =====================================================
        // GENERATE UNIT CODE
        // =====================================================

        saved.setUnitCode(
                unitCodeGeneratorService.generate(
                        saved.getId(),
                        saved.getUnitShortName()
                )
        );

        // =====================================================
        // FINAL SAVE
        // =====================================================

        UnitEntity updated =
                unitRepository.save(saved);

        return ApiResponse.success(
                unitMapper.toResponse(updated),
                "Unit created successfully."
        );
    }


    // =====================================================
    // UPDATE UNIT
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<UnitResponse> update(
            Long id,
            UnitRequest request) {

        log.info(
                "Updating Unit : {}",
                id
        );

        // =====================================================
        // FIND UNIT
        // =====================================================

        UnitEntity unit =
                unitValidation.validateUnit(id);

        // =====================================================
        // VALIDATE DUPLICATE NAME
        // Exclude current unit
        // =====================================================

        unitValidation.validateDuplicateName(
                id,
                request.getUnitName()
        );

        // =====================================================
        // UPDATE ENTITY
        // =====================================================

        unitMapper.updateEntity(
                request,
                unit
        );

        // =====================================================
        // STATUS
        // =====================================================

        unit.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : unit.getStatus()
        );

        // =====================================================
        // AUDIT
        // =====================================================

        baseEntityUtil.prepareForUpdate(unit);

        UnitEntity updated =
                unitRepository.save(unit);

        return ApiResponse.success(
                unitMapper.toResponse(updated),
                "Unit updated successfully."
        );
    }


    // =====================================================
    // GET BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<UnitResponse> getById(
            Long id) {

        log.info(
                "Fetching Unit : {}",
                id
        );

        UnitEntity unit =
                unitValidation.validateUnit(id);

        return ApiResponse.success(
                unitMapper.toResponse(unit),
                "Unit fetched successfully."
        );
    }


    // =====================================================
    // GET ALL
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<UnitResponse>> getAll(
            String search,
            Status status,
            Pageable pageable) {

        log.info(
                "Fetching Units | search={}, status={}",
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

        Specification<UnitEntity> specification =
                UnitSpecification.containsKeyword(search)
                        .and(
                                UnitSpecification.hasStatus(status)
                        );

        // =====================================================
        // FETCH
        // =====================================================

        Page<UnitEntity> units =
                unitRepository.findAll(
                        specification,
                        pageable
                );

        return ApiResponse.success(
                toPageResponse(units),
                "Units fetched successfully."
        );
    }


    // =====================================================
    // DELETE UNIT
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<Void> delete(
            Long id) {

        log.info(
                "Deleting Unit : {}",
                id
        );

        // =====================================================
        // FIND UNIT
        // =====================================================

        UnitEntity unit =
                unitValidation.validateUnit(id);

        // =====================================================
        // SOFT DELETE
        // =====================================================

        unit.setActive(false);

        baseEntityUtil.prepareForUpdate(unit);

        unitRepository.save(unit);

        return ApiResponse.success(
                null,
                "Unit deleted successfully."
        );
    }


    // =====================================================
    // PAGE RESPONSE
    // =====================================================

    private PageResponse<UnitResponse> toPageResponse(
            Page<UnitEntity> page) {

        return PageResponse.<UnitResponse>builder()
                .content(
                        page.getContent()
                                .stream()
                                .map(unitMapper::toResponse)
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