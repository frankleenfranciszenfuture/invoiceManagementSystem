package com.ims.utils.validation;

import com.ims.entity.UnitEntity;
import com.ims.exception.DuplicateResourceException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UnitValidation {

    private final UnitRepository unitRepository;

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
}
