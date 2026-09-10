package com.ims.utils.validation;


import com.ims.entity.CategoryEntity;
import com.ims.exception.BadRequestException;
import com.ims.exception.DuplicateResourceException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.repository.CategoryRepository;
import com.ims.repository.SubCategoryRepository;
import com.ims.utils.apiConstants.CategoryConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CategoryValidation {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;


    // =====================================================
    // CREATE VALIDATION
    // =====================================================

    public void validateCreate(CategoryEntity entity) {

        if (entity == null) {
            throw new BadRequestException(
                    "Category is required."
            );
        }

        validateCategoryName(
                entity.getCategoryName()
        );

        if (categoryRepository
                .existsByCategoryNameIgnoreCaseAndActiveTrue(
                        entity.getCategoryName().trim()
                )) {

            throw new DuplicateResourceException(
                    CategoryConstants.DUPLICATE_NAME
            );
        }
    }


    // =====================================================
    // UPDATE VALIDATION
    // =====================================================

    public void validateUpdate(CategoryEntity entity) {

        if (entity == null) {
            throw new BadRequestException(
                    "Category is required."
            );
        }

        validateCategoryName(
                entity.getCategoryName()
        );

        boolean exists =
                categoryRepository
                        .existsByCategoryNameIgnoreCaseAndActiveTrueAndIdNot(
                                entity.getCategoryName().trim(),
                                entity.getId()
                        );

        if (exists) {

            throw new DuplicateResourceException(
                    CategoryConstants.DUPLICATE_NAME
            );
        }
    }


    // =====================================================
    // DELETE VALIDATION
    // =====================================================

    /**
     * Delete Validation
     */
    public void validateDelete(CategoryEntity category) {

        if (category == null) {

            throw new ResourceNotFoundException(
                    CategoryConstants.NOT_FOUND
            );
        }

        // Already inactive
        if (Boolean.FALSE.equals(category.getActive())) {

            throw new BadRequestException(
                    "Category is already deleted."
            );
        }

        // Check active subcategories
        boolean hasActiveSubCategories =
                subCategoryRepository
                        .existsByCategory_IdAndActiveTrue(
                                category.getId()
                        );

        if (hasActiveSubCategories) {

            throw new BadRequestException(
                    "Cannot delete category. Please delete all subcategories first."
            );
        }
    }


    // =====================================================
    // CATEGORY NAME VALIDATION
    // =====================================================

    private void validateCategoryName(String name) {

        if (name == null ||
                name.trim().isEmpty()) {

            throw new BadRequestException(
                    "Category name is required."
            );
        }
    }


    // =====================================================
    // VALIDATE CATEGORY BY ID
    // =====================================================

    public CategoryEntity validateCategory(
            Long id
    ) {

        if (id == null) {

            throw new BadRequestException(
                    "Category id is required."
            );
        }

        return categoryRepository
                .findByIdAndActiveTrue(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                CategoryConstants.NOT_FOUND
                        )
                );
    }


    // =====================================================
    // DUPLICATE NAME VALIDATION - CREATE
    // =====================================================

    public void validateDuplicateName(
            String categoryName
    ) {

        validateCategoryName(categoryName);

        if (categoryRepository
                .existsByCategoryNameIgnoreCaseAndActiveTrue(
                        categoryName.trim()
                )) {

            throw new DuplicateResourceException(
                    CategoryConstants.DUPLICATE_NAME
            );
        }
    }


    // =====================================================
    // DUPLICATE NAME VALIDATION - UPDATE
    // =====================================================

    public void validateDuplicateName(
            Long id,
            String categoryName
    ) {

        validateCategoryName(categoryName);

        if (id == null) {

            throw new BadRequestException(
                    "Category id is required."
            );
        }

        if (categoryRepository
                .existsByCategoryNameIgnoreCaseAndActiveTrueAndIdNot(
                        categoryName.trim(),
                        id
                )) {

            throw new DuplicateResourceException(
                    CategoryConstants.DUPLICATE_NAME
            );
        }
    }
}