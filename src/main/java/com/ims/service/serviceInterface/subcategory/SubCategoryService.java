package com.ims.service.serviceInterface.subcategory;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.subCategory.CreateSubCategoryRequest;
import com.ims.dtos.subCategory.SubCategoryDropdownResponse;
import com.ims.dtos.subCategory.SubCategoryResponse;
import com.ims.dtos.subCategory.UpdateSubCategoryRequest;
import com.ims.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SubCategoryService {


    // =====================================================
    // CREATE
    // =====================================================

    ApiResponse<SubCategoryResponse> createSubCategory(
            CreateSubCategoryRequest request
    );


    // =====================================================
    // UPDATE
    // =====================================================

    SubCategoryResponse updateSubCategory(
            Long id,
            UpdateSubCategoryRequest request
    );


    // =====================================================
    // GET BY ID
    // =====================================================

    SubCategoryResponse getSubCategoryById(
            Long id
    );


    // =====================================================
    // GET ALL
    // =====================================================

    ApiResponse<PageResponse<SubCategoryResponse>> getAllSubCategories(
            Pageable pageable
    );


    // =====================================================
    // DELETE
    // =====================================================

    void deleteSubCategory(
            Long id
    );


    // =====================================================
    // UPDATE STATUS
    // =====================================================

    SubCategoryResponse updateStatus(
            Long id,
            Status status
    );


    // =====================================================
    // SEARCH
    // =====================================================

    Page<SubCategoryResponse> search(
            String keyword,
            Long categoryId,
            Boolean active,
            Pageable pageable
    );


    // =====================================================
    // DROPDOWN
    // =====================================================

    List<SubCategoryDropdownResponse> dropdown();


    // =====================================================
    // DROPDOWN BY CATEGORY
    // =====================================================

    List<SubCategoryDropdownResponse> dropdownByCategory(
            Long categoryId
    );
}
