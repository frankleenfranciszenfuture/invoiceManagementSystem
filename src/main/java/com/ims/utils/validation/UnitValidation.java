package com.ims.utils.validation;

import com.ims.entity.UnitEntity;
import com.ims.enums.Status;
import com.ims.exception.BadRequestException;
import com.ims.exception.DuplicateResourceException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.repository.ProductRepository;
import com.ims.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UnitValidation {

    private final UnitRepository unitRepository;
    private final ProductRepository productRepository;
    // =====================================================
    // VALIDATE UNIT
    // =====================================================

    public UnitEntity validateUnit(Long unitId) {

        if (unitId == null) {
            throw new ResourceNotFoundException(
                    "Unit ID is required."
            );
        }

        return unitRepository
                .findByIdAndActiveTrue(unitId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Unit not found."
                        )
                );
    }

    // =====================================================
    // DUPLICATE UNIT NAME - CREATE
    // ACTIVE ONLY
    // =====================================================

    public void validateDuplicateName(String unitName) {

        if (unitName == null || unitName.isBlank()) {
            return;
        }

        String name = unitName.trim();

        if (unitRepository
                .existsByUnitNameIgnoreCaseAndActiveTrue(name)) {

            throw new DuplicateResourceException(
                    "Unit name already exists."
            );
        }
    }

    // =====================================================
    // DUPLICATE UNIT NAME - UPDATE
    // Exclude current unit
    // ACTIVE ONLY
    // =====================================================

    public void validateDuplicateName(
            Long id,
            String unitName) {

        if (unitName == null || unitName.isBlank()) {
            return;
        }

        String name = unitName.trim();

        if (unitRepository
                .existsByUnitNameIgnoreCaseAndIdNotAndActiveTrue(
                        name,
                        id
                )) {

            throw new DuplicateResourceException(
                    "Unit name already exists."
            );
        }
    }

    // =====================================================
    // DUPLICATE UNIT CODE - CREATE
    // ACTIVE ONLY
    // =====================================================

    public void validateDuplicateCode(String unitCode) {

        if (unitCode == null || unitCode.isBlank()) {
            return;
        }

        String code = unitCode.trim();

        if (unitRepository
                .existsByUnitCodeIgnoreCaseAndActiveTrue(code)) {

            throw new DuplicateResourceException(
                    "Unit code already exists."
            );
        }
    }

    // =====================================================
    // DUPLICATE UNIT CODE - UPDATE
    // Exclude current unit
    // ACTIVE ONLY
    // =====================================================

    public void validateDuplicateCode(
            Long id,
            String unitCode) {

        if (unitCode == null || unitCode.isBlank()) {
            return;
        }

        String code = unitCode.trim();

        if (unitRepository
                .existsByUnitCodeIgnoreCaseAndIdNotAndActiveTrue(
                        code,
                        id
                )) {

            throw new DuplicateResourceException(
                    "Unit code already exists."
            );
        }
    }

    // =====================================================
// UNIT STATUS VALIDATION
// =====================================================

    public void validateCanChangeStatus(
            UnitEntity unit,
            Status requestedStatus
    ) {

        if (unit == null) {
            throw new BadRequestException(
                    "Unit is required."
            );
        }

        if (requestedStatus == null) {
            throw new BadRequestException(
                    "Status is required."
            );
        }

        if (requestedStatus != Status.INACTIVE) {
            return;
        }

        if (unit.getStatus() == Status.INACTIVE) {
            return;
        }

        boolean used =
                productRepository.existsByUnitsId(
                        unit.getId()
                );

        if (used) {
            throw new BadRequestException(
                    "Unit cannot be made INACTIVE because it is already used by a product."
            );
        }
    }


    // =====================================================
// UNIT DELETE VALIDATION
// =====================================================

    public void validateCanDelete(
            Long unitId
    ) {

        if (unitId == null) {
            throw new BadRequestException(
                    "Unit ID is required."
            );
        }

        boolean used =
                productRepository.existsByUnitsId(unitId);

        if (used) {
            throw new BadRequestException(
                    "Unit cannot be deleted because it is already used by a product."
            );
        }
    }
}
