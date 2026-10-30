package com.ims.service.impl.warehouse;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.common.AuditResponse;
import com.ims.dtos.warehouse.WarehouseRequest;
import com.ims.dtos.warehouse.WarehouseResponse;
import com.ims.entity.WarehouseEntity;
import com.ims.enums.Status;
import com.ims.repository.WarehouseRepository;
import com.ims.service.serviceInterface.warehouse.WarehouseService;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.specification.WarehouseSpecification;
import com.ims.utils.validation.WarehouseValidation;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseValidation validation;
    private final BaseEntityUtil baseEntityUtil;

    // =====================================================
    // CREATE
    // =====================================================

    @Override
    public ApiResponse<WarehouseResponse> create(WarehouseRequest dto) {

        validateRequest(dto);

        String warehouseName = dto.getWarehouseName().trim();

        validation.validateCreate(warehouseName);

        WarehouseEntity warehouse = WarehouseEntity.builder()
                .warehouseCode(generateWarehouseCode())
                .warehouseName(warehouseName)
                .contactPerson(trimToNull(dto.getContactPerson()))
                .phone(trimToNull(dto.getPhone()))
                .email(trimToNull(dto.getEmail()))
                .address(trimToNull(dto.getAddress()))
                .city(trimToNull(dto.getCity()))
                .state(trimToNull(dto.getState()))
                .pincode(trimToNull(dto.getPincode()))
                .status(dto.getStatus() != null
                        ? dto.getStatus()
                        : Status.ACTIVE)
                .active(true)
                .build();

        baseEntityUtil.prepareForCreate(warehouse);

        WarehouseEntity saved = warehouseRepository.save(warehouse);

        return ApiResponse.success(
                toResponse(saved),
                "Warehouse created successfully"
        );
    }

    // =====================================================
    // UPDATE
    // =====================================================

    @Override
    public ApiResponse<WarehouseResponse> update(
            Long id,
            WarehouseRequest dto) {

        validateRequest(dto);

        WarehouseEntity warehouse = validation.validateWarehouse(id);

        String warehouseName = dto.getWarehouseName().trim();

        validation.validateUpdate(id, warehouseName);

        warehouse.setWarehouseName(warehouseName);
        warehouse.setContactPerson(trimToNull(dto.getContactPerson()));
        warehouse.setPhone(trimToNull(dto.getPhone()));
        warehouse.setEmail(trimToNull(dto.getEmail()));
        warehouse.setAddress(trimToNull(dto.getAddress()));
        warehouse.setCity(trimToNull(dto.getCity()));
        warehouse.setState(trimToNull(dto.getState()));
        warehouse.setPincode(trimToNull(dto.getPincode()));

        if (dto.getStatus() != null) {
            warehouse.setStatus(dto.getStatus());
        }

        baseEntityUtil.prepareForUpdate(warehouse);
        // Do not call prepareForCreate() here if it resets createdAt.
        // Update updatedAt using your BaseEntityUtil update method if available.

        WarehouseEntity updated = warehouseRepository.save(warehouse);

        return ApiResponse.success(
                toResponse(updated),
                "Warehouse updated successfully"
        );
    }

    // =====================================================
    // GET BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<WarehouseResponse> getById(Long id) {

        WarehouseEntity warehouse = validation.validateWarehouse(id);

        return ApiResponse.success(
                toResponse(warehouse),
                "Warehouse fetched successfully"
        );
    }

    // =====================================================
    // GET ALL
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<WarehouseResponse>> getAll(
            String search,
            Status status,
            Boolean active,
            Pageable pageable) {

        Specification<WarehouseEntity> spec =
                WarehouseSpecification.filter(search, status, active);

        Page<WarehouseEntity> page =
                warehouseRepository.findAll(spec, pageable);

        PageResponse<WarehouseResponse> pageResponse =
                toPageResponse(page);

        return ApiResponse.success(
                pageResponse,
                "Warehouses fetched successfully"
        );
    }

    // =====================================================
    // DELETE / DEACTIVATE
    // =====================================================

    @Override
    public ApiResponse<Void> delete(Long id) {

        WarehouseEntity warehouse = validation.validateWarehouse(id);

        if (Boolean.FALSE.equals(warehouse.getActive())) {
            return ApiResponse.success(
                    null,
                    "Warehouse is already deactivated"
            );
        }

        warehouse.setActive(false);

        warehouseRepository.save(warehouse);

        return ApiResponse.success(
                null,
                "Warehouse deactivated successfully"
        );
    }

    // =====================================================
    // GENERATE WAREHOUSE CODE
    // =====================================================

    private String generateWarehouseCode() {

        return warehouseRepository.findTopByOrderByIdDesc()
                .map(warehouse -> {

                    String previousCode = warehouse.getWarehouseCode();

                    if (previousCode == null ||
                            !previousCode.matches("WH-\\d+")) {
                        return "WH-0001";
                    }

                    try {
                        long number = Long.parseLong(
                                previousCode.substring(3)
                        );

                        return String.format("WH-%04d", number + 1);

                    } catch (NumberFormatException exception) {
                        return "WH-0001";
                    }
                })
                .orElse("WH-0001");
    }

    // =====================================================
    // RESPONSE MAPPER
    // =====================================================

    private WarehouseResponse toResponse(WarehouseEntity warehouse) {

        return WarehouseResponse.builder()
                .id(warehouse.getId())
                .warehouseCode(warehouse.getWarehouseCode())
                .warehouseName(warehouse.getWarehouseName())
                .contactPerson(warehouse.getContactPerson())
                .phone(warehouse.getPhone())
                .email(warehouse.getEmail())
                .address(warehouse.getAddress())
                .city(warehouse.getCity())
                .state(warehouse.getState())
                .pincode(warehouse.getPincode())
                .status(warehouse.getStatus())
                .audit(AuditResponse.builder()
                        .createdAt(warehouse.getCreatedAt())
                        .updatedAt(warehouse.getUpdatedAt())
                        .createdBy(warehouse.getCreatedBy())
                        .updatedBy(warehouse.getUpdatedBy())
                        .active(warehouse.getActive())
                        .build())
                .build();
    }

    // =====================================================
    // PAGE RESPONSE
    // =====================================================

    private PageResponse<WarehouseResponse> toPageResponse(
            Page<WarehouseEntity> page) {

        return PageResponse.<WarehouseResponse>builder()
                .content(
                        page.getContent()
                                .stream()
                                .map(this::toResponse)
                                .toList()
                )
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    // =====================================================
    // NULL VALIDATION
    // =====================================================

    private void validateRequest(WarehouseRequest dto) {

        if (dto == null) {
            throw new IllegalArgumentException(
                    "Warehouse request cannot be null."
            );
        }

        if (dto.getWarehouseName() == null ||
                dto.getWarehouseName().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Warehouse name is required."
            );
        }
    }

    private String trimToNull(String value) {

        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        return value.trim();
    }
}