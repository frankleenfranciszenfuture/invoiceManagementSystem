package com.ims.controller.subCategory;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.subCategory.CreateSubCategoryRequest;
import com.ims.dtos.subCategory.SubCategoryDropdownResponse;
import com.ims.dtos.subCategory.SubCategoryResponse;
import com.ims.dtos.subCategory.UpdateSubCategoryRequest;
import com.ims.enums.Status;
import com.ims.service.serviceInterface.subcategory.SubCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sub-categories")
@RequiredArgsConstructor
@Slf4j
@Tag(
        name = "Sub Category Management",
        description = "APIs for managing product sub categories"
)
public class SubCategoryController {

    private final SubCategoryService subCategoryService;


    // ============================
    // CREATE
    // ============================

    @PostMapping
    @Operation(summary = "Create Sub Category")
    public ResponseEntity<ApiResponse<SubCategoryResponse>> create(

            @Valid
            @RequestBody CreateSubCategoryRequest request
    ) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        subCategoryService.createSubCategory(
                                request
                        )
                );
    }


    // ============================
    // UPDATE
    // ============================

    @PutMapping("/{id}")
    @Operation(summary = "Update Sub Category")
    public ResponseEntity<ApiResponse<SubCategoryResponse>> update(

            @PathVariable Long id,

            @Valid
            @RequestBody UpdateSubCategoryRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        subCategoryService.updateSubCategory(
                                id,
                                request
                        ),
                        "Sub Category updated successfully"
                )
        );
    }


    // ============================
    // GET BY ID
    // ============================

    @GetMapping("/{id}")
    @Operation(summary = "Get Sub Category By ID")
    public ResponseEntity<ApiResponse<SubCategoryResponse>> getById(

            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        subCategoryService.getSubCategoryById(id),
                        "Sub Category fetched successfully"
                )
        );
    }


    // ============================
    // GET ALL
    // ============================

    @GetMapping
    @Operation(summary = "Get All Sub Categories")
    public ApiResponse<PageResponse<SubCategoryResponse>> getAllSubCategories(

            Pageable pageable
    ) {

        return subCategoryService.getAllSubCategories(
                pageable
        );
    }


    // ============================
    // DELETE
    // ============================

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Sub Category")
    public ResponseEntity<ApiResponse<Void>> delete(

            @PathVariable Long id
    ) {

        subCategoryService.deleteSubCategory(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        null,
                        "Sub Category deleted successfully"
                )
        );
    }


    // ============================
    // UPDATE STATUS
    // ============================

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update Sub Category Status")
    public ResponseEntity<ApiResponse<SubCategoryResponse>> updateStatus(

            @PathVariable Long id,

            @RequestParam Status status
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        subCategoryService.updateStatus(
                                id,
                                status
                        ),
                        "Status updated successfully"
                )
        );
    }


    // ============================
    // SEARCH
    // ============================

    @GetMapping("/search")
    @Operation(summary = "Search Sub Categories")
    public ResponseEntity<ApiResponse<Page<SubCategoryResponse>>> search(

            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            Long categoryId,

            @RequestParam(required = false)
            Boolean active,

            @PageableDefault(
                    size = 10,
                    sort = "name"
            )
            Pageable pageable
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        subCategoryService.search(
                                keyword,
                                categoryId,
                                active,
                                pageable
                        ),
                        "Search completed successfully"
                )
        );
    }


    // ============================
    // DROPDOWN
    // ============================

    @GetMapping("/dropdown")
    @Operation(summary = "Sub Category Dropdown")
    public ResponseEntity<ApiResponse<List<SubCategoryDropdownResponse>>> dropdown() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        subCategoryService.dropdown(),
                        "Dropdown loaded successfully"
                )
        );
    }


    // ============================
    // DROPDOWN BY CATEGORY
    // ============================

    @GetMapping("/category/{categoryId}/dropdown")
    @Operation(summary = "Sub Category Dropdown By Category")
    public ResponseEntity<ApiResponse<List<SubCategoryDropdownResponse>>> dropdownByCategory(

            @PathVariable Long categoryId
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        subCategoryService.dropdownByCategory(
                                categoryId
                        ),
                        "Category dropdown loaded successfully"
                )
        );
    }
}