package com.ims.controller.inventory;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;

import com.ims.dtos.inventory.InventoryAdjustmentRequest;
import com.ims.dtos.inventory.InventoryOpeningStockRequest;

import com.ims.dtos.inventory.InventoryStockResponse;
import com.ims.dtos.inventory.InventoryTransactionResponse;

import com.ims.enums.InventoryMovementType;
import com.ims.enums.InventoryReferenceType;

import com.ims.service.serviceInterface.inventory.InventoryService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // =========================================================
    // CREATE OPENING STOCK
    // =========================================================

    @PostMapping("/opening-stock")
    public ResponseEntity<ApiResponse<InventoryStockResponse>> createOpeningStock(
            @Valid @RequestBody InventoryOpeningStockRequest request) {

        InventoryStockResponse response =
                inventoryService.createOpeningStock(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        response,
                        "Opening stock created successfully."
                ));
    }

    // =========================================================
    // STOCK ADJUSTMENT
    // =========================================================

    @PostMapping("/adjustments")
    public ResponseEntity<ApiResponse<InventoryStockResponse>> adjustStock(
            @Valid @RequestBody InventoryAdjustmentRequest request) {

        InventoryStockResponse response =
                inventoryService.adjustStock(request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        response,
                        "Stock adjusted successfully."
                )
        );
    }

    // =========================================================
    // GET STOCK BY ID
    // =========================================================

    @GetMapping("/stocks/{stockId}")
    public ResponseEntity<ApiResponse<InventoryStockResponse>> getStockById(
            @PathVariable Long stockId) {

        InventoryStockResponse response =
                inventoryService.getStockById(stockId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        response,
                        "Inventory stock fetched successfully."
                )
        );
    }

    // =========================================================
    // GET ALL STOCKS WITH FILTERS AND PAGINATION
    // =========================================================

    @GetMapping("/stocks")
    public ResponseEntity<ApiResponse<PageResponse<InventoryStockResponse>>> getAllStocks(

            @RequestParam(required = false) Long productId,

            @RequestParam(required = false) Long warehouseId,

            @RequestParam(required = false) Long unitId,

            @RequestParam(required = false) Long sizeId,

            @RequestParam(required = false) Boolean availableOnly,

            @PageableDefault(size = 10) Pageable pageable) {

        Page<InventoryStockResponse> page =
                inventoryService.getAllStocks(
                        productId,
                        warehouseId,
                        unitId,
                        sizeId,
                        availableOnly,
                        pageable
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        toPageResponse(page),
                        "Inventory stocks fetched successfully."
                )
        );
    }

    // =========================================================
    // GET STOCK BY PRODUCT
    // =========================================================

    @GetMapping("/stocks/product/{productId}")
    public ResponseEntity<ApiResponse<PageResponse<InventoryStockResponse>>> getStockByProduct(

            @PathVariable Long productId,

            @PageableDefault(size = 10) Pageable pageable) {

        Page<InventoryStockResponse> page =
                inventoryService.getStockByProduct(productId, pageable);

        return ResponseEntity.ok(
                ApiResponse.success(
                        toPageResponse(page),
                        "Product inventory fetched successfully."
                )
        );
    }

    // =========================================================
    // GET STOCK BY WAREHOUSE
    // =========================================================

    @GetMapping("/stocks/warehouse/{warehouseId}")
    public ResponseEntity<ApiResponse<PageResponse<InventoryStockResponse>>> getStockByWarehouse(

            @PathVariable Long warehouseId,

            @PageableDefault(size = 10) Pageable pageable) {

        Page<InventoryStockResponse> page =
                inventoryService.getStockByWarehouse(warehouseId, pageable);

        return ResponseEntity.ok(
                ApiResponse.success(
                        toPageResponse(page),
                        "Warehouse inventory fetched successfully."
                )
        );
    }

    // =========================================================
    // GET LOW STOCK
    // =========================================================

    @GetMapping("/stocks/low-stock")
    public ResponseEntity<ApiResponse<PageResponse<InventoryStockResponse>>> getLowStock(

            @RequestParam BigDecimal minimumQuantity,

            @PageableDefault(size = 10) Pageable pageable) {

        Page<InventoryStockResponse> page =
                inventoryService.getLowStock(minimumQuantity, pageable);

        return ResponseEntity.ok(
                ApiResponse.success(
                        toPageResponse(page),
                        "Low stock records fetched successfully."
                )
        );
    }

    // =========================================================
    // GET ALL INVENTORY TRANSACTIONS WITH FILTERS
    // =========================================================

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<PageResponse<InventoryTransactionResponse>>> getAllTransactions(

            @RequestParam(required = false) Long productId,

            @RequestParam(required = false) Long warehouseId,

            @RequestParam(required = false) Long unitId,

            @RequestParam(required = false) Long sizeId,

            @RequestParam(required = false) InventoryMovementType movementType,

            @RequestParam(required = false) InventoryReferenceType referenceType,

            @RequestParam(required = false) Long referenceId,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime toDate,

            @PageableDefault(size = 10) Pageable pageable) {

        Page<InventoryTransactionResponse> page =
                inventoryService.getAllTransactions(
                        productId,
                        warehouseId,
                        unitId,
                        sizeId,
                        movementType,
                        referenceType,
                        referenceId,
                        fromDate,
                        toDate,
                        pageable
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        toPageResponse(page),
                        "Inventory transactions fetched successfully."
                )
        );
    }

    // =========================================================
    // GET TRANSACTION BY ID
    // =========================================================

    @GetMapping("/transactions/{transactionId}")
    public ResponseEntity<ApiResponse<InventoryTransactionResponse>> getTransactionById(
            @PathVariable Long transactionId) {

        InventoryTransactionResponse response =
                inventoryService.getTransactionById(transactionId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        response,
                        "Inventory transaction fetched successfully."
                )
        );
    }

    // =========================================================
    // GET TRANSACTIONS BY PRODUCT
    // =========================================================

    @GetMapping("/transactions/product/{productId}")
    public ResponseEntity<ApiResponse<PageResponse<InventoryTransactionResponse>>> getTransactionsByProduct(

            @PathVariable Long productId,

            @PageableDefault(size = 10) Pageable pageable) {

        Page<InventoryTransactionResponse> page =
                inventoryService.getTransactionsByProduct(productId, pageable);

        return ResponseEntity.ok(
                ApiResponse.success(
                        toPageResponse(page),
                        "Product inventory transactions fetched successfully."
                )
        );
    }

    // =========================================================
    // GET TRANSACTIONS BY WAREHOUSE
    // =========================================================

    @GetMapping("/transactions/warehouse/{warehouseId}")
    public ResponseEntity<ApiResponse<PageResponse<InventoryTransactionResponse>>> getTransactionsByWarehouse(

            @PathVariable Long warehouseId,

            @PageableDefault(size = 10) Pageable pageable) {

        Page<InventoryTransactionResponse> page =
                inventoryService.getTransactionsByWarehouse(warehouseId, pageable);

        return ResponseEntity.ok(
                ApiResponse.success(
                        toPageResponse(page),
                        "Warehouse inventory transactions fetched successfully."
                )
        );
    }

    // =========================================================
    // COMMON PAGE RESPONSE
    // =========================================================

    private <T> PageResponse<T> toPageResponse(Page<T> page) {

        return PageResponse.<T>builder()
                .content(page.getContent())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}

