package com.ims.controller.party;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.party.PartyRequest;
import com.ims.dtos.party.PartyResponse;
import com.ims.enums.PartyType;
import com.ims.enums.Status;
import com.ims.service.serviceInterface.party.PartyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/parties")
@RequiredArgsConstructor
public class PartyController {

    private final PartyService partyService;


    // =====================================================
    // CREATE PARTY
    // =====================================================

    @PostMapping
    public ResponseEntity<ApiResponse<PartyResponse>> createParty(

            @Valid
            @RequestBody
            PartyRequest request

    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        partyService.createParty(
                                request
                        )
                );
    }


    // =====================================================
    // UPDATE PARTY
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PartyResponse>> updateParty(

            @PathVariable("id")
            Long id,

            @Valid
            @RequestBody
            PartyRequest request

    ) {

        return ResponseEntity.ok(
                partyService.updateParty(
                        id,
                        request
                )
        );
    }


    // =====================================================
    // GET PARTY BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PartyResponse>> getPartyById(

            @PathVariable("id")
            Long id

    ) {

        return ResponseEntity.ok(
                partyService.getPartyById(
                        id
                )
        );
    }


    // =====================================================
    // GET ALL PARTIES
    // =====================================================

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PartyResponse>>> getAllParties(

            @RequestParam(value = "search", required = false)
            String search,

            @RequestParam(value = "partyType", required = false)
            PartyType partyType,

            @RequestParam(value = "status", required = false)
            Status status,

            Pageable pageable

    ) {

        return ResponseEntity.ok(
                partyService.getAllParties(
                        search,
                        partyType,
                        status,
                        pageable
                )
        );
    }


    // =====================================================
    // DELETE PARTY
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteParty(

            @PathVariable("id")
            Long id

    ) {

        return ResponseEntity.ok(
                partyService.deleteParty(
                        id
                )
        );
    }
}
