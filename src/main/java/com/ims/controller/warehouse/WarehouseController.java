
package com.ims.controller.warehouse;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.warehouse.WarehouseRequest;
import com.ims.dtos.warehouse.WarehouseResponse;
import com.ims.enums.Status;
import com.ims.service.serviceInterface.warehouse.WarehouseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/warehouses")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseService warehouseService;

    // =====================================================
    // CREATE
    // =====================================================

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ApiResponse<WarehouseResponse>> create(
            @Valid @RequestBody WarehouseRequest dto) {

        return ResponseEntity.ok(
                warehouseService.create(dto)
        );
    }

    // =====================================================
    // UPDATE
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WarehouseResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody WarehouseRequest dto) {

        return ResponseEntity.ok(
                warehouseService.update(id, dto)
        );
    }

    // =====================================================
    // GET BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WarehouseResponse>> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                warehouseService.getById(id)
        );
    }

    // =====================================================
    // GET ALL
    // =====================================================

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<WarehouseResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Boolean active,

            @PageableDefault(size = 20, sort = "warehouseName")
            Pageable pageable) {

        return ResponseEntity.ok(
                warehouseService.getAll(
                        search,
                        status,
                        active,
                        pageable
                )
        );
    }

    // =====================================================
    // DELETE
    // =====================================================

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                warehouseService.delete(id)
        );
    }
}
