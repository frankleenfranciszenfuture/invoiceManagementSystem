package com.ims.utils.validation;

import com.ims.entity.SizeEntity;
import com.ims.exception.DuplicateResourceException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.repository.SizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SizeValidation {

    private final SizeRepository sizeRepository;


    // =====================================================
    // VALIDATE SIZE
    // =====================================================

    public SizeEntity validateSize(
            Long sizeId
    ) {

        if (sizeId == null) {

            throw new ResourceNotFoundException(
                    "Size is required."
            );
        }

        return sizeRepository
                .findByIdAndActiveTrue(
                        sizeId
                )
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Size not found."
                        )
                );
    }


    // =====================================================
    // DUPLICATE SIZE NAME - CREATE
    // Only ACTIVE records are checked
    // =====================================================

    public void validateDuplicateName(
            String sizeName
    ) {

        if (sizeName == null ||
                sizeName.isBlank()) {

            return;
        }

        sizeName = sizeName.trim();

        if (sizeRepository
                .existsBySizeNameIgnoreCaseAndActiveTrue(
                        sizeName
                )) {

            throw new DuplicateResourceException(
                    "Size name already exists."
            );
        }
    }


    // =====================================================
    // DUPLICATE SIZE NAME - UPDATE
    // Ignore current ID
    // Only ACTIVE records are checked
    // =====================================================

    public void validateDuplicateName(
            Long id,
            String sizeName
    ) {

        if (sizeName == null ||
                sizeName.isBlank()) {

            return;
        }

        sizeName = sizeName.trim();

        if (sizeRepository
                .existsBySizeNameIgnoreCaseAndIdNotAndActiveTrue(
                        sizeName,
                        id
                )) {

            throw new DuplicateResourceException(
                    "Size name already exists."
            );
        }
    }


    // =====================================================
    // DUPLICATE SIZE SHORT NAME - CREATE
    // Only ACTIVE records are checked
    // =====================================================

    public void validateDuplicateShortName(
            String sizeShortName
    ) {

        if (sizeShortName == null ||
                sizeShortName.isBlank()) {

            return;
        }

        sizeShortName = sizeShortName.trim();

        if (sizeRepository
                .existsBySizeShortNameIgnoreCaseAndActiveTrue(
                        sizeShortName
                )) {

            throw new DuplicateResourceException(
                    "Size short name already exists."
            );
        }
    }


    // =====================================================
    // DUPLICATE SIZE SHORT NAME - UPDATE
    // Ignore current ID
    // Only ACTIVE records are checked
    // =====================================================

    public void validateDuplicateShortName(
            Long id,
            String sizeShortName
    ) {

        if (sizeShortName == null ||
                sizeShortName.isBlank()) {

            return;
        }

        sizeShortName = sizeShortName.trim();

        if (sizeRepository
                .existsBySizeShortNameIgnoreCaseAndIdNotAndActiveTrue(
                        sizeShortName,
                        id
                )) {

            throw new DuplicateResourceException(
                    "Size short name already exists."
            );
        }
    }


    // =====================================================
    // DUPLICATE SIZE CODE - CREATE
    // Only ACTIVE records are checked
    // =====================================================

    public void validateDuplicateCode(
            String sizeCode
    ) {

        if (sizeCode == null ||
                sizeCode.isBlank()) {

            return;
        }

        sizeCode = sizeCode.trim();

        if (sizeRepository
                .existsBySizeCodeIgnoreCaseAndActiveTrue(
                        sizeCode
                )) {

            throw new DuplicateResourceException(
                    "Size code already exists."
            );
        }
    }


    // =====================================================
    // DUPLICATE SIZE CODE - UPDATE
    // Ignore current ID
    // Only ACTIVE records are checked
    // =====================================================

    public void validateDuplicateCode(
            Long id,
            String sizeCode
    ) {

        if (sizeCode == null ||
                sizeCode.isBlank()) {

            return;
        }

        sizeCode = sizeCode.trim();

        if (sizeRepository
                .existsBySizeCodeIgnoreCaseAndIdNotAndActiveTrue(
                        sizeCode,
                        id
                )) {

            throw new DuplicateResourceException(
                    "Size code already exists."
            );
        }
    }
}
