package com.ims.controller.product;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.product.ProductRequest;
import com.ims.dtos.product.ProductResponse;
import com.ims.enums.Status;
import com.ims.service.serviceInterface.product.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;


    // =====================================================
    // CREATE PRODUCT
    // =====================================================

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(

            @RequestPart("product")
            ProductRequest request,

            @RequestPart(
                    value = "image",
                    required = false
            )
            MultipartFile image

    ) {

        log.info(
                "========== PRODUCT CREATE CONTROLLER =========="
        );

        return ResponseEntity.ok(
                productService.createProduct(
                        request,
                        image
                )
        );
    }


    // =====================================================
    // UPDATE PRODUCT
    // =====================================================

    @PutMapping(
            value = "/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(

            @PathVariable Long id,

            @RequestPart("product")
            ProductRequest request,

            @RequestPart(
                    value = "image",
                    required = false
            )
            MultipartFile image

    ) {

        log.info(
                "========== PRODUCT UPDATE CONTROLLER =========="
        );

        log.info(
                "Updating product ID = {}",
                id
        );

        return ResponseEntity.ok(
                productService.updateProduct(
                        id,
                        request,
                        image
                )
        );
    }


    // =====================================================
    // GET ALL PRODUCTS
    // =====================================================

    @GetMapping
    public ResponseEntity<
            ApiResponse<PageResponse<ProductResponse>>
            > getAllProducts(

            @RequestParam(
                    required = false
            )
            String search,

            @RequestParam(
                    required = false
            )
            Status status,

            Pageable pageable

    ) {

        return ResponseEntity.ok(
                productService.getAllProducts(
                        search,
                        status,
                        pageable
                )
        );
    }


    // =====================================================
    // GET PRODUCT BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(

            @PathVariable Long id

    ) {

        return ResponseEntity.ok(
                productService.getProductById(id)
        );
    }


    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(

            @PathVariable Long id

    ) {

        return ResponseEntity.ok(
                productService.deleteProduct(id)
        );
    }


    // =====================================================
    // REACTIVATE PRODUCT
    // =====================================================

    @PatchMapping("/{id}/reactivate")
    public ResponseEntity<ApiResponse<ProductResponse>> reactivateProduct(

            @PathVariable Long id

    ) {

        return ResponseEntity.ok(
                productService.reactivateProduct(id)
        );
    }


    // =====================================================
    // SEARCH PRODUCTS
    // =====================================================

    @GetMapping("/search")
    public ResponseEntity<
            ApiResponse<Page<ProductResponse>>
            > searchProducts(

            @RequestParam(
                    defaultValue = ""
            )
            String keyword,

            Pageable pageable

    ) {

        return ResponseEntity.ok(
                productService.searchProducts(
                        keyword,
                        pageable
                )
        );
    }


    // =====================================================
    // PRODUCTS BY STATUS
    // =====================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<
            ApiResponse<Page<ProductResponse>>
            > getProductsByStatus(

            @PathVariable Status status,

            Pageable pageable

    ) {

        return ResponseEntity.ok(
                productService.getProductsByStatus(
                        status,
                        pageable
                )
        );
    }
}