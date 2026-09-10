package com.ims.service.impl.subcategory;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.subCategory.CreateSubCategoryRequest;
import com.ims.dtos.subCategory.SubCategoryDropdownResponse;
import com.ims.dtos.subCategory.SubCategoryResponse;
import com.ims.dtos.subCategory.UpdateSubCategoryRequest;
import com.ims.entity.CategoryEntity;
import com.ims.entity.SubCategoryEntity;
import com.ims.enums.Status;
import com.ims.exception.ResourceNotFoundException;
import com.ims.mapper.subCategory.SubCategoryMapper;
import com.ims.repository.SubCategoryRepository;
import com.ims.service.serviceInterface.subcategory.SubCategoryService;
import com.ims.utils.apiConstants.SubCategoryConstants;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.validation.CategoryValidation;
import com.ims.utils.specification.SubCategorySpecification;
import com.ims.utils.validation.SubCategoryValidation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubCategoryServiceImpl implements SubCategoryService {

    private final SubCategoryRepository subCategoryRepository;

    private final SubCategoryMapper subCategoryMapper;

    private final BaseEntityUtil baseEntityUtil;

    private final SubCategoryValidation subCategoryValidation;

    private final CategoryValidation categoryValidation;


    // ============================
    // CREATE
    // ============================

    @Override
    @Transactional
    public ApiResponse<SubCategoryResponse> createSubCategory(
            CreateSubCategoryRequest request
    ) {

        // Validate and get category
        CategoryEntity category =
                categoryValidation.validateCategory(
                        request.getCategoryId()
                );

        // Map request to entity
        SubCategoryEntity subCategory =
                subCategoryMapper.toEntity(request);

        // Set category
        subCategory.setCategory(category);

        // Validate sub category
        subCategoryValidation.validateCreate(
                subCategory
        );

        // Generate global sub-category code
        subCategory.setSubCategoryCode(
                generateSubCategoryCode()
        );

        // Audit fields
        baseEntityUtil.prepareForCreate(subCategory);

        // Save
        SubCategoryEntity saved =
                subCategoryRepository.save(subCategory);

        return ApiResponse.success(
                subCategoryMapper.toResponse(saved),
                "Sub Category created successfully."
        );
    }


    // ============================
    // UPDATE
    // ============================

    @Override
    @Transactional
    public SubCategoryResponse updateSubCategory(
            Long id,
            UpdateSubCategoryRequest request
    ) {

        // Find existing sub-category
        SubCategoryEntity entity =
                subCategoryValidation.validateSubCategory(id);

        // Validate category
        CategoryEntity category =
                categoryValidation.validateCategory(
                        request.getCategoryId()
                );

        // Update request fields
        subCategoryMapper.updateEntity(
                request,
                entity
        );

        // Set category
        entity.setCategory(category);

        // Validate update
        subCategoryValidation.validateUpdate(
                entity
        );

        // Audit fields
        baseEntityUtil.prepareForUpdate(entity);

        // Save
        SubCategoryEntity updated =
                subCategoryRepository.save(entity);

        return subCategoryMapper.toResponse(updated);
    }


    // ============================
    // GET BY ID
    // ============================

    @Override
    @Transactional(readOnly = true)
    public SubCategoryResponse getSubCategoryById(
            Long id
    ) {

        SubCategoryEntity entity =
                subCategoryValidation.validateSubCategory(id);

        return subCategoryMapper.toResponse(entity);
    }


    // ============================
    // GET ALL
    // ============================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<SubCategoryResponse>> getAllSubCategories(
            Pageable pageable
    ) {

        Page<SubCategoryEntity> subCategories =
                subCategoryRepository
                        .findByActiveTrueOrderByNameAsc(
                                pageable
                        );

        return ApiResponse.success(
                toPageResponse(subCategories),
                SubCategoryConstants.LIST
        );
    }


    // ============================
    // DELETE
    // ============================

    @Override
    @Transactional
    public void deleteSubCategory(
            Long id
    ) {

        SubCategoryEntity entity =
                subCategoryValidation.validateSubCategory(id);

        /*
         * Future:
         * Check product mapping
         */

        entity.setActive(false);
        entity.setStatus(Status.INACTIVE);

        baseEntityUtil.prepareForUpdate(entity);

        subCategoryRepository.save(entity);

        log.info(
                "Sub Category deleted : {}",
                entity.getSubCategoryCode()
        );
    }


    // ============================
    // STATUS UPDATE
    // ============================

    @Override
    @Transactional
    public SubCategoryResponse updateStatus(
            Long id,
            Status status
    ) {

        log.info(
                "Updating Sub Category status. Id: {}, Status: {}",
                id,
                status
        );

        SubCategoryEntity entity =
                subCategoryValidation.validateSubCategory(id);

        entity.setStatus(status);
        entity.setActive(status == Status.ACTIVE);

        baseEntityUtil.prepareForUpdate(entity);

        SubCategoryEntity updated =
                subCategoryRepository.save(entity);

        log.info(
                "Sub Category status updated successfully. Code: {}, Status: {}",
                updated.getSubCategoryCode(),
                status
        );

        return subCategoryMapper.toResponse(updated);
    }


    // ============================
    // FIND ENTITY
    // ============================

    private SubCategoryEntity getEntityById(
            Long id
    ) {

        return subCategoryRepository
                .findByIdAndActiveTrue(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                SubCategoryConstants.NOT_FOUND
                        ));
    }


    // ============================
    // CODE GENERATION
    // ============================

    private String generateSubCategoryCode() {

        long nextNumber = 1;

        SubCategoryEntity last =
                subCategoryRepository
                        .findTopByOrderByIdDesc()
                        .orElse(null);

        if (last != null
                && last.getSubCategoryCode() != null
                && !last.getSubCategoryCode().isBlank()) {

            String lastCode =
                    last.getSubCategoryCode();

            try {

                String number =
                        lastCode.substring(
                                lastCode.lastIndexOf("-") + 1
                        );

                nextNumber =
                        Long.parseLong(number) + 1;

            } catch (NumberFormatException ex) {

                log.warn(
                        "Unable to parse last sub-category code: {}",
                        lastCode
                );
            }
        }

        return String.format(
                "SUB%d-%05d",
                Year.now().getValue(),
                nextNumber
        );
    }


    // ============================
    // SEARCH
    // ============================

    @Override
    @Transactional(readOnly = true)
    public Page<SubCategoryResponse> search(
            String keyword,
            Long categoryId,
            Boolean active,
            Pageable pageable
    ) {

        Specification<SubCategoryEntity> specification =
                Specification.allOf(
                        SubCategorySpecification.hasKeyword(keyword),
                        SubCategorySpecification.hasCategory(categoryId),
                        SubCategorySpecification.hasActive(active)
                );

        return subCategoryRepository
                .findAll(specification, pageable)
                .map(subCategoryMapper::toResponse);
    }


    // ============================
    // DROPDOWN
    // ============================

    @Override
    @Transactional(readOnly = true)
    public List<SubCategoryDropdownResponse> dropdown() {

        List<SubCategoryEntity> entities =
                subCategoryRepository
                        .findByActiveTrueOrderByNameAsc();

        return entities.stream()
                .map(subCategoryMapper::toDropdown)
                .toList();
    }


    // ============================
    // DROPDOWN BY CATEGORY
    // ============================

    @Override
    @Transactional(readOnly = true)
    public List<SubCategoryDropdownResponse> dropdownByCategory(
            Long categoryId
    ) {

        // Validate category
        categoryValidation.validateCategory(categoryId);

        List<SubCategoryEntity> entities =
                subCategoryRepository
                        .findByCategory_IdAndActiveTrueOrderByNameAsc(
                                categoryId
                        );

        return entities.stream()
                .map(subCategoryMapper::toDropdown)
                .toList();
    }


    // ============================
    // PAGE RESPONSE
    // ============================

    private PageResponse<SubCategoryResponse> toPageResponse(
            Page<SubCategoryEntity> page
    ) {

        return PageResponse.<SubCategoryResponse>builder()
                .content(
                        subCategoryMapper.toResponse(
                                page.getContent()
                        )
                )
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}