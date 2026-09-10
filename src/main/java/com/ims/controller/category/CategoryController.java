package com.ims.controller.category;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.category.CategoryRequest;
import com.ims.dtos.category.CategoryResponse;
import com.ims.enums.Status;
import com.ims.service.serviceInterface.category.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;


    // =====================================================
    // CREATE CATEGORY
    // =====================================================

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(

            @Valid
            @RequestBody
            CategoryRequest request
    ) {

        return ResponseEntity.ok(
                categoryService.createCategory(
                        request
                )
        );
    }


    // =====================================================
    // UPDATE CATEGORY
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(

            @PathVariable
            Long id,

            @Valid
            @RequestBody
            CategoryRequest request
    ) {

        return ResponseEntity.ok(
                categoryService.updateCategory(
                        id,
                        request
                )
        );
    }


    // =====================================================
    // GET CATEGORY BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(

            @PathVariable
            Long id
    ) {

        return ResponseEntity.ok(
                categoryService.getCategoryById(
                        id
                )
        );
    }


    // =====================================================
    // GET ALL CATEGORIES
    // =====================================================

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CategoryResponse>>> getAllCategories(
            Pageable pageable
    ) {

        return ResponseEntity.ok(
                categoryService.getAllCategories(
                        pageable
                )
        );
    }


    // =====================================================
    // DELETE CATEGORY
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(

            @PathVariable
            Long id
    ) {

        return ResponseEntity.ok(
                categoryService.deleteCategory(
                        id
                )
        );
    }


    // =====================================================
    // SEARCH CATEGORIES
    // =====================================================

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<CategoryResponse>>> searchCategories(

            @RequestParam
            String keyword,

            Pageable pageable
    ) {

        return ResponseEntity.ok(
                categoryService.searchCategories(
                        keyword,
                        pageable
                )
        );
    }


    // =====================================================
    // GET CATEGORIES BY STATUS
    // =====================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<PageResponse<CategoryResponse>>> getCategoriesByStatus(

            @PathVariable
            Status status,

            Pageable pageable
    ) {

        return ResponseEntity.ok(
                categoryService.getCategoriesByStatus(
                        status,
                        pageable
                )
        );
    }
}