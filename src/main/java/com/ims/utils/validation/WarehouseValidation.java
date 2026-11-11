
package com.ims.utils.validation;

import com.ims.entity.WarehouseEntity;
import com.ims.exception.DuplicateResourceException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.repository.WarehouseRepository;
import com.ims.utils.apiConstants.WarehouseConstants;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WarehouseValidation {

    private final WarehouseRepository warehouseRepository;

    // =====================================================
    // VALIDATE WAREHOUSE
    // =====================================================

    public WarehouseEntity validateWarehouse(Long id) {

        WarehouseEntity warehouse = warehouseRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                WarehouseConstants.NOT_FOUND
                        )
                );

        if (Boolean.FALSE.equals(warehouse.getActive())) {
            throw new ResourceNotFoundException(
                    WarehouseConstants.NOT_FOUND
            );
        }

        return warehouse;
    }

    // =====================================================
    // VALIDATE CREATE
    // =====================================================

    public void validateCreate(String warehouseName) {

        validateDuplicateName(warehouseName, null);
    }

    // =====================================================
    // VALIDATE UPDATE
    // =====================================================

    public void validateUpdate(Long id, String warehouseName) {

        validateDuplicateName(warehouseName, id);
    }

    // =====================================================
    // DUPLICATE VALIDATION
    // =====================================================

    private void validateDuplicateName(String warehouseName, Long id) {

        String normalizedName = warehouseName.trim();

        boolean exists = id == null
                ? warehouseRepository
                .existsByWarehouseNameIgnoreCaseAndActiveTrue(
                        normalizedName
                )
                : warehouseRepository
                .existsByWarehouseNameIgnoreCaseAndActiveTrueAndIdNot(
                        normalizedName,
                        id
                );

        if (exists) {
            throw new DuplicateResourceException(
                    WarehouseConstants.DUPLICATE_NAME
            );
        }
    }
}
