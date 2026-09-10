package com.ims.service.serviceInterface.product;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.product.ProductRequest;
import com.ims.dtos.product.ProductResponse;
import com.ims.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface ProductService {

    /**
     * Create Product
     */
    ApiResponse<ProductResponse> createProduct(
            ProductRequest request,
            MultipartFile image
    );

    /**
     * Update Product
     */
    ApiResponse<ProductResponse> updateProduct(
            Long id,
            ProductRequest request,
            MultipartFile image
    );

    /**
     * Get All Products
     *
     * Supports:
     * - search
     * - status
     * - pagination
     */
    ApiResponse<PageResponse<ProductResponse>> getAllProducts(
            String search,
            Status status,
            Pageable pageable
    );

    /**
     * Get Product By Id
     */
    ApiResponse<ProductResponse> getProductById(
            Long id
    );

    /**
     * Soft Delete Product
     */
    ApiResponse<Void> deleteProduct(
            Long productId
    );

    /**
     * Reactivate Product
     */
    ApiResponse<ProductResponse> reactivateProduct(
            Long productId
    );

    /**
     * Search Products
     *
     * Search by:
     * - product name
     * - product code
     * - SKU
     * - brand
     * - HSN code
     */
    ApiResponse<Page<ProductResponse>> searchProducts(
            String keyword,
            Pageable pageable
    );

    /**
     * Get Products By Status
     *
     * ACTIVE
     * INACTIVE
     */
    ApiResponse<Page<ProductResponse>> getProductsByStatus(
            Status status,
            Pageable pageable
    );
}
