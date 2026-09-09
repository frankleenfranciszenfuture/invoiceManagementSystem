package com.ims.controller.taxMaster;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.taxMaster.TaxMasterRequest;
import com.ims.dtos.taxMaster.TaxMasterResponse;
import com.ims.enums.Status;
import com.ims.enums.TaxType;
import com.ims.service.serviceInterface.taxMaster.TaxMasterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tax-masters")
@RequiredArgsConstructor
public class TaxMasterController {

    private final TaxMasterService taxMasterService;


    // =====================================================
    // CREATE TAX MASTER
    // =====================================================

    @PostMapping
    public ResponseEntity<ApiResponse<TaxMasterResponse>> createTaxMaster(
            @Valid @RequestBody TaxMasterRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        taxMasterService.create(request)
                );
    }


    // =====================================================
    // UPDATE TAX MASTER
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxMasterResponse>> updateTaxMaster(
            @PathVariable Long id,
            @Valid @RequestBody TaxMasterRequest request) {

        return ResponseEntity.ok(
                taxMasterService.update(
                        id,
                        request
                )
        );
    }


    // =====================================================
    // GET TAX MASTER BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxMasterResponse>> getTaxMasterById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                taxMasterService.getById(id)
        );
    }


    // =====================================================
    // GET ALL TAX MASTERS
    // =====================================================

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TaxMasterResponse>>> getAllTaxMasters(

            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            TaxType taxType,

            @RequestParam(required = false)
            Status status,

            Pageable pageable) {

        return ResponseEntity.ok(
                taxMasterService.getAll(
                        search,
                        taxType,
                        status,
                        pageable
                )
        );
    }


    // =====================================================
    // DELETE TAX MASTER
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTaxMaster(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                taxMasterService.delete(id)
        );
    }
}