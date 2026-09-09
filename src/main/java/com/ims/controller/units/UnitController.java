package com.ims.controller.units;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.units.UnitRequest;
import com.ims.dtos.units.UnitResponse;
import com.ims.enums.Status;
import com.ims.service.serviceInterface.units.UnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;

    // =====================================================
    // CREATE UNIT
    // =====================================================

    @PostMapping
    public ResponseEntity<ApiResponse<UnitResponse>> create(
            @Valid @RequestBody UnitRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        unitService.create(request)
                );
    }

    // =====================================================
    // UPDATE UNIT
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UnitRequest request) {

        return ResponseEntity.ok(
                unitService.update(
                        id,
                        request
                )
        );
    }

    // =====================================================
    // GET BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitResponse>> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                unitService.getById(id)
        );
    }

    // =====================================================
    // GET ALL / SEARCH / FILTER
    // =====================================================

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UnitResponse>>> getAllUnits(
            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            Status status,

            Pageable pageable) {

        return ResponseEntity.ok(
                unitService.getAll(
                        search,
                        status,
                        pageable
                )
        );
    }

    // =====================================================
    // DELETE UNIT
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                unitService.delete(id)
        );
    }
}

