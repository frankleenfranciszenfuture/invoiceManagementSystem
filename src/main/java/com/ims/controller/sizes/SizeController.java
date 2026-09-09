package com.ims.controller.sizes;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.sizes.SizeRequest;
import com.ims.dtos.sizes.SizeResponse;
import com.ims.enums.Status;
import com.ims.service.serviceInterface.sizes.SizeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sizes")
@RequiredArgsConstructor
public class SizeController {

    private final SizeService sizeService;


    // =====================================================
    // CREATE SIZE
    // =====================================================

    @PostMapping
    public ResponseEntity<ApiResponse<SizeResponse>> createSize(
            @Valid @RequestBody SizeRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        sizeService.create(request)
                );
    }


    // =====================================================
    // UPDATE SIZE
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SizeResponse>> updateSize(
            @PathVariable Long id,
            @Valid @RequestBody SizeRequest request) {

        return ResponseEntity.ok(
                sizeService.update(
                        id,
                        request
                )
        );
    }


    // =====================================================
    // GET SIZE BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SizeResponse>> getSizeById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                sizeService.getById(id)
        );
    }


    // =====================================================
    // GET ALL SIZES
    // =====================================================

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SizeResponse>>> getAllSizes(

            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            Status status,

            Pageable pageable) {

        return ResponseEntity.ok(
                sizeService.getAll(
                        search,
                        status,
                        pageable
                )
        );
    }


    // =====================================================
    // DELETE SIZE
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSize(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                sizeService.delete(id)
        );
    }
}

