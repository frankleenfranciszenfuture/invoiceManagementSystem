package com.ims.utils.validation;


import com.ims.entity.CategoryEntity;
import com.ims.entity.SubCategoryEntity;
import com.ims.exception.BadRequestException;
import com.ims.exception.DuplicateResourceException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.repository.CategoryRepository;
import com.ims.repository.SubCategoryRepository;
import com.ims.utils.apiConstants.SubCategoryConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SubCategoryValidation {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;


    // =====================================================
    // VALIDATE CATEGORY
    // =====================================================

    /**
     * Validate Category.
     *
     * Branch-independent:
     * - Category only needs to exist and be active.
     */
    public CategoryEntity validateCategory(Long categoryId) {

        if (categoryId == null) {
            throw new BadRequestException(
                    "Category is required."
            );
        }

        return categoryRepository
                .findByIdAndActiveTrue(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found."
                        )
                );
    }


    // =====================================================
    // CREATE VALIDATION
    // =====================================================

    /**
     * Validate SubCategory before create.
     *
     * Same SubCategory name:
     * - NOT allowed inside the same active Category
     * - Allowed if previous SubCategory is inactive
     * - Allowed under another Category
     */
    public void validateCreate(
            SubCategoryEntity entity
    ) {

        if (entity == null) {
            throw new BadRequestException(
                    "Sub category is required."
            );
        }


        // =================================================
        // CATEGORY
        // =================================================

        if (entity.getCategory() == null) {
            throw new BadRequestException(
                    "Category is required."
            );
        }

        if (entity.getCategory().getId() == null) {
            throw new BadRequestException(
                    "Category is required."
            );
        }

        // Make sure category exists and is active
        validateCategory(entity.getCategory().getId());


        // =================================================
        // NAME
        // =================================================

        if (entity.getName() == null ||
                entity.getName().trim().isEmpty()) {

            throw new BadRequestException(
                    "Sub category name is required."
            );
        }

        String name = entity.getName().trim();

        Long categoryId =
                entity.getCategory().getId();


        // =================================================
        // DUPLICATE NAME - ACTIVE ONLY
        // SAME CATEGORY
        // =================================================

        boolean exists =
                subCategoryRepository
                        .existsByNameIgnoreCaseAndCategory_IdAndActiveTrue(
                                name,
                                categoryId
                        );

        if (exists) {
            throw new DuplicateResourceException(
                    SubCategoryConstants.DUPLICATE_NAME
            );
        }
    }


    // =====================================================
    // UPDATE VALIDATION
    // =====================================================

    /**
     * Validate SubCategory before update.
     *
     * The current record is excluded from duplicate checking.
     */
    public void validateUpdate(
            SubCategoryEntity entity
    ) {

        if (entity == null) {
            throw new BadRequestException(
                    "Sub category is required."
            );
        }


        // =================================================
        // ID
        // =================================================

        if (entity.getId() == null) {
            throw new BadRequestException(
                    "Sub category id is required."
            );
        }


        // =================================================
        // CATEGORY
        // =================================================

        if (entity.getCategory() == null) {
            throw new BadRequestException(
                    "Category is required."
            );
        }

        if (entity.getCategory().getId() == null) {
            throw new BadRequestException(
                    "Category is required."
            );
        }

        // Make sure category exists and is active
        validateCategory(entity.getCategory().getId());


        // =================================================
        // NAME
        // =================================================

        if (entity.getName() == null ||
                entity.getName().trim().isEmpty()) {

            throw new BadRequestException(
                    "Sub category name is required."
            );
        }

        String name = entity.getName().trim();

        Long categoryId =
                entity.getCategory().getId();


        // =================================================
        // DUPLICATE NAME - ACTIVE ONLY
        // EXCLUDE CURRENT ID
        // =================================================

        boolean exists =
                subCategoryRepository
                        .existsByNameIgnoreCaseAndCategory_IdAndIdNotAndActiveTrue(
                                name,
                                categoryId,
                                entity.getId()
                        );

        if (exists) {
            throw new DuplicateResourceException(
                    SubCategoryConstants.DUPLICATE_NAME
            );
        }
    }


    // =====================================================
    // CODE VALIDATION - CREATE
    // =====================================================

    /**
     * Validate SubCategory code.
     *
     * Code is globally unique.
     */
    public void validateCode(
            String code
    ) {

        if (code == null ||
                code.trim().isEmpty()) {

            throw new BadRequestException(
                    "Sub category code is required."
            );
        }

        String normalizedCode =
                code.trim();

        if (subCategoryRepository
                .existsBySubCategoryCodeAndActiveTrue(
                        normalizedCode
                )) {

            throw new DuplicateResourceException(
                    SubCategoryConstants.DUPLICATE_CODE
            );
        }
    }


    // =====================================================
    // ACCESS VALIDATION
    // =====================================================

    /**
     * Validate SubCategory exists and is active.
     *
     * Branch-independent.
     */
    public SubCategoryEntity validateSubCategory(
            Long subCategoryId
    ) {

        if (subCategoryId == null) {
            throw new BadRequestException(
                    "Sub category is required."
            );
        }

        return subCategoryRepository
                .findByIdAndActiveTrue(subCategoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Sub category not found."
                        )
                );
    }


    // =====================================================
    // DUPLICATE NAME - CREATE
    // =====================================================

    public void validateDuplicateName(
            String name,
            Long categoryId
    ) {

        if (name == null || name.isBlank()) {
            return;
        }

        if (categoryId == null) {
            throw new BadRequestException(
                    "Category is required."
            );
        }

        name = name.trim();

        if (subCategoryRepository
                .existsByNameIgnoreCaseAndCategory_IdAndActiveTrue(
                        name,
                        categoryId
                )) {

            throw new DuplicateResourceException(
                    "Sub category name already exists in this category."
            );
        }
    }


    // =====================================================
    // DUPLICATE NAME - UPDATE
    // =====================================================

    public void validateDuplicateName(
            Long id,
            String name,
            Long categoryId
    ) {

        if (name == null || name.isBlank()) {
            return;
        }

        if (id == null) {
            throw new BadRequestException(
                    "Sub category id is required."
            );
        }

        if (categoryId == null) {
            throw new BadRequestException(
                    "Category is required."
            );
        }

        name = name.trim();

        if (subCategoryRepository
                .existsByNameIgnoreCaseAndCategory_IdAndIdNotAndActiveTrue(
                        name,
                        categoryId,
                        id
                )) {

            throw new DuplicateResourceException(
                    "Sub category name already exists in this category."
            );
        }
    }
}

