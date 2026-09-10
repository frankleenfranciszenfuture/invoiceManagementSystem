package com.ims.service.impl.category;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.category.CategoryRequest;
import com.ims.dtos.category.CategoryResponse;
import com.ims.entity.CategoryEntity;
import com.ims.enums.Status;
import com.ims.exception.ResourceNotFoundException;
import com.ims.mapper.category.CategoryMapper;
import com.ims.repository.CategoryRepository;
import com.ims.repository.ProductRepository;
import com.ims.repository.SubCategoryRepository;

import com.ims.service.serviceInterface.category.CategoryService;
import com.ims.utils.apiConstants.CategoryConstants;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.validation.CategoryValidation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final CategoryValidation categoryValidation;
    private final BaseEntityUtil baseEntityUtil;
    private final ProductRepository productRepository;
    private final SubCategoryRepository subCategoryRepository;


    // =====================================================
    // CREATE CATEGORY
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<CategoryResponse> createCategory(
            CategoryRequest request
    ) {

        CategoryEntity category =
                categoryMapper.toEntity(request);

        categoryValidation.validateCreate(category);

        category.setCategoryCode(
                generateCategoryCode()
        );

        baseEntityUtil.prepareForCreate(category);

        CategoryEntity savedCategory =
                categoryRepository.save(category);

        return ApiResponse.success(
                categoryMapper.toResponse(savedCategory),
                CategoryConstants.CREATED
        );
    }


    // =====================================================
    // UPDATE CATEGORY
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<CategoryResponse> updateCategory(
            Long id,
            CategoryRequest request
    ) {

        CategoryEntity category =
                categoryValidation.validateCategory(id);

        categoryMapper.updateEntity(
                request,
                category
        );

        categoryValidation.validateUpdate(category);

        baseEntityUtil.prepareForUpdate(category);

        CategoryEntity updatedCategory =
                categoryRepository.save(category);

        log.info(
                "Category updated successfully : {}",
                updatedCategory.getCategoryCode()
        );

        return ApiResponse.success(
                categoryMapper.toResponse(updatedCategory),
                CategoryConstants.UPDATED
        );
    }


    // =====================================================
    // GET CATEGORY BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CategoryResponse> getCategoryById(
            Long id
    ) {

        CategoryEntity category =
                categoryValidation.validateCategory(id);

        return ApiResponse.success(
                categoryMapper.toResponse(category),
                CategoryConstants.FOUND
        );
    }


    // =====================================================
    // GET ALL CATEGORIES
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<CategoryResponse>> getAllCategories(
            Pageable pageable
    ) {

        Page<CategoryEntity> categories =
                categoryRepository
                        .findByActiveTrueOrderByCategoryNameAsc(
                                pageable
                        );

        return ApiResponse.success(
                toPageResponse(categories),
                CategoryConstants.LIST
        );
    }


    // =====================================================
    // DELETE CATEGORY
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<Void> deleteCategory(
            Long id
    ) {

        CategoryEntity category =
                categoryValidation.validateCategory(id);

        categoryValidation.validateDelete(category);

        category.setActive(false);

        baseEntityUtil.prepareForUpdate(category);

        categoryRepository.save(category);

        log.info(
                "Category deleted successfully: {}",
                category.getCategoryCode()
        );

        return ApiResponse.success(
                null,
                CategoryConstants.DELETED
        );
    }


    // =====================================================
    // SEARCH CATEGORIES
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<CategoryResponse>> searchCategories(
            String keyword,
            Pageable pageable
    ) {

        Page<CategoryEntity> categories =
                categoryRepository
                        .findByCategoryNameContainingIgnoreCaseAndActiveTrue(
                                keyword,
                                pageable
                        );

        return ApiResponse.success(
                toPageResponse(categories),
                CategoryConstants.SEARCH
        );
    }


    // =====================================================
    // GET CATEGORIES BY STATUS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<CategoryResponse>> getCategoriesByStatus(
            Status status,
            Pageable pageable
    ) {

        Page<CategoryEntity> categories =
                categoryRepository
                        .findByStatusAndActiveTrue(
                                status,
                                pageable
                        );

        if (categories.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No categories found with status '"
                            + status + "'."
            );
        }

        return ApiResponse.success(
                toPageResponse(categories),
                CategoryConstants.LIST
        );
    }


    // =====================================================
    // GENERATE CATEGORY CODE
    // =====================================================

    /**
     * Generates a globally unique category code.
     *
     * Format:
     *
     * CAT2026-0001
     * CAT2026-0002
     * CAT2026-0003
     */
    private String generateCategoryCode() {

        int currentYear =
                Year.now().getValue();

        Optional<CategoryEntity> lastCategory =
                categoryRepository.findTopByOrderByIdDesc();

        int nextNumber = 1;

        if (lastCategory.isPresent()) {

            String lastCode =
                    lastCategory.get().getCategoryCode();

            if (lastCode != null &&
                    !lastCode.isBlank()) {

                String[] parts =
                        lastCode.split("-");

                // CAT2026-0001
                if (parts.length == 2) {

                    String yearPart =
                            parts[0].replace("CAT", "");

                    try {

                        if (Integer.parseInt(yearPart)
                                == currentYear) {

                            nextNumber =
                                    Integer.parseInt(parts[1]) + 1;
                        }

                    } catch (NumberFormatException ex) {

                        log.warn(
                                "Unable to parse category code: {}",
                                lastCode
                        );
                    }
                }
            }
        }

        return String.format(
                "CAT%d-%04d",
                currentYear,
                nextNumber
        );
    }


    // =====================================================
    // PAGE RESPONSE
    // =====================================================

    private PageResponse<CategoryResponse> toPageResponse(
            Page<CategoryEntity> page
    ) {

        return PageResponse.<CategoryResponse>builder()
                .content(
                        page.getContent()
                                .stream()
                                .map(categoryMapper::toResponse)
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
