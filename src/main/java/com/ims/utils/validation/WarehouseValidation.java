
package com.ims.utils.validation;

import com.ims.entity.WarehouseEntity;
import com.ims.exception.BadRequestException;
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

        return warehouseRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                WarehouseConstants.NOT_FOUND
                        ));
    }

    // =====================================================
    // VALIDATE CREATE
    // =====================================================

    public void validateCreate(String warehouseName) {

        validateWarehouseName(warehouseName);

        validateDuplicateName(warehouseName.trim());
    }

    // =====================================================
    // VALIDATE UPDATE
    // =====================================================

    public void validateUpdate(
            Long id,
            String warehouseName) {

        validateWarehouseName(warehouseName);

        if (warehouseRepository
                .existsByWarehouseNameIgnoreCaseAndIdNot(
                        warehouseName.trim(),
                        id
                )) {

            throw new DuplicateResourceException(
                    WarehouseConstants.DUPLICATE_NAME
            );
        }
    }

    // =====================================================
    // DUPLICATE VALIDATION
    // =====================================================

    public void validateDuplicateName(String warehouseName) {

        if (warehouseRepository
                .existsByWarehouseNameIgnoreCase(
                        warehouseName.trim()
                )) {

            throw new DuplicateResourceException(
                    WarehouseConstants.DUPLICATE_NAME
            );
        }
    }

    // =====================================================
    // WAREHOUSE NAME VALIDATION
    // =====================================================

    private void validateWarehouseName(String warehouseName) {

        if (warehouseName == null || warehouseName.trim().isEmpty()) {

            throw new BadRequestException(
                    "Warehouse name is required."
            );
        }
    }
}
