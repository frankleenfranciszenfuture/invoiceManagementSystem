package com.ims.controller.inventory;

import com.ims.common.ApiResponse;
import com.ims.dtos.inventory.InventoryDashboardFilter;
import com.ims.dtos.inventory.InventoryDashboardResponse;
import com.ims.service.serviceInterface.inventory.InventoryService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryDashboardController {

    private final InventoryService inventoryService;

    // =====================================================
    // INVENTORY DASHBOARD
    // =====================================================

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<InventoryDashboardResponse>>
    getInventoryDashboard(

            @RequestParam(required = false)
            @org.springframework.format.annotation.DateTimeFormat(
                    iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME
            )
            java.time.LocalDateTime fromDate,

            @RequestParam(required = false)
            @org.springframework.format.annotation.DateTimeFormat(
                    iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME
            )
            java.time.LocalDateTime toDate,

            @RequestParam(required = false)
            Long warehouseId,

            @RequestParam(required = false)
            Long productId,

            @RequestParam(required = false)
            Long unitId,

            @RequestParam(required = false)
            Long sizeId,

            @RequestParam(required = false)
            com.ims.enums.InventoryMovementType movementType,

            @RequestParam(required = false)
            com.ims.enums.InventoryReferenceType referenceType,

            @RequestParam(defaultValue = "0")
            Integer page,

            @RequestParam(defaultValue = "10")
            Integer size,

            @RequestParam(defaultValue = "transactionDate")
            String sortBy,

            @RequestParam(defaultValue = "DESC")
            String sortDirection
    ) {

        InventoryDashboardFilter filter =
                InventoryDashboardFilter.builder()
                        .fromDate(fromDate)
                        .toDate(toDate)
                        .warehouseId(warehouseId)
                        .productId(productId)
                        .unitId(unitId)
                        .sizeId(sizeId)
                        .movementType(movementType)
                        .referenceType(referenceType)
                        .page(page)
                        .size(size)
                        .sortBy(sortBy)
                        .sortDirection(sortDirection)
                        .build();

        InventoryDashboardResponse response =
                inventoryService.getInventoryDashboard(filter);

        return ResponseEntity.ok(
                ApiResponse.<InventoryDashboardResponse>builder()
                        .success(true)
                        .message("Inventory dashboard fetched successfully.")
                        .data(response)
                        .build()
        );
    }
}
