package com.ims.controller.party;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.party.clearance.CreditClearanceRequest;
import com.ims.dtos.party.clearance.CreditClearanceResponse;
import com.ims.service.serviceInterface.party.CreditClearanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/credit-clearance")
@RequiredArgsConstructor
public class CreditClearanceController {

    private final CreditClearanceService creditClearanceService;

    // =====================================================
    // CREATE
    // =====================================================

    @PostMapping
    public ResponseEntity<ApiResponse<CreditClearanceResponse>> create(
            @Valid @RequestBody CreditClearanceRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        creditClearanceService.create(request)
                );
    }

    // =====================================================
    // UPDATE / EDIT
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CreditClearanceResponse>> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody CreditClearanceRequest request) {

        return ResponseEntity.ok(
                creditClearanceService.update(
                        id,
                        request
                )
        );
    }

    // =====================================================
    // GET BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CreditClearanceResponse>> getById(
            @PathVariable("id") Long id) {

        return ResponseEntity.ok(
                creditClearanceService.getById(id)
        );
    }

    // =====================================================
    // GET ALL
    // =====================================================

    @GetMapping
    public ResponseEntity<
            ApiResponse<PageResponse<CreditClearanceResponse>>
            > getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                creditClearanceService.getAll(
                        page,
                        size
                )
        );
    }

    // =====================================================
    // GET BY PARTY
    // =====================================================

    @GetMapping("/party/{partyId}")
    public ResponseEntity<
            ApiResponse<List<CreditClearanceResponse>>
            > getByParty(
            @PathVariable("partyId") Long partyId) {

        return ResponseEntity.ok(
                creditClearanceService.getByParty(partyId)
        );
    }

    // =====================================================
    // GET BY PARTY - PAGED
    // =====================================================

    @GetMapping("/party/{partyId}/paged")
    public ResponseEntity<
            ApiResponse<PageResponse<CreditClearanceResponse>>
            > getByPartyPaged(
            @PathVariable("partyId") Long partyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                creditClearanceService.getByPartyPaged(
                        partyId,
                        page,
                        size
                )
        );
    }

    // =====================================================
    // GET BY DATE RANGE
    // =====================================================

    @GetMapping("/date-range")
    public ResponseEntity<
            ApiResponse<List<CreditClearanceResponse>>
            > getByDateRange(
            @RequestParam LocalDate fromDate,
            @RequestParam LocalDate toDate) {

        return ResponseEntity.ok(
                creditClearanceService.getByDateRange(
                        fromDate,
                        toDate
                )
        );
    }

    // =====================================================
    // DELETE / REVERSE
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable("id") Long id) {

        return ResponseEntity.ok(
                creditClearanceService.delete(id)
        );
    }
}

