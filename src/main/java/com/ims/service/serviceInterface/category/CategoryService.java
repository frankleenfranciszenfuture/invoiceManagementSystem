package com.ims.service.serviceInterface.category;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.category.CategoryRequest;
import com.ims.dtos.category.CategoryResponse;
import com.ims.enums.Status;
import org.springframework.data.domain.Pageable;

public interface CategoryService {

    ApiResponse<CategoryResponse> createCategory(
            CategoryRequest request
    );

    ApiResponse<CategoryResponse> updateCategory(
            Long id,
            CategoryRequest request
    );

    ApiResponse<CategoryResponse> getCategoryById(
            Long id
    );

    ApiResponse<PageResponse<CategoryResponse>> getAllCategories(
            Pageable pageable
    );

    ApiResponse<Void> deleteCategory(
            Long id
    );

    ApiResponse<PageResponse<CategoryResponse>> searchCategories(
            String keyword,
            Pageable pageable
    );

    ApiResponse<PageResponse<CategoryResponse>> getCategoriesByStatus(
            Status status,
            Pageable pageable
    );
}