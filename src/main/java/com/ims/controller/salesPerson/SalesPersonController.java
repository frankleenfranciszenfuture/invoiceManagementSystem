package com.ims.controller.salesPerson;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.party.PartyRequest;
import com.ims.dtos.party.PartyResponse;
import com.ims.dtos.salesPerson.SalesPersonRequest;
import com.ims.dtos.salesPerson.SalesPersonResponse;
import com.ims.enums.PartyType;
import com.ims.enums.SalesPersonType;
import com.ims.enums.Status;
import com.ims.service.serviceInterface.party.PartyService;
import com.ims.service.serviceInterface.salesPerson.SalesPersonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/salesPerson")
@RequiredArgsConstructor
public class SalesPersonController {

    private final SalesPersonService salesPersonService;


    // =====================================================
    // CREATE salesPerson
    // =====================================================

    @PostMapping
    public ResponseEntity<ApiResponse<SalesPersonResponse>> createSalesPerson(

            @Valid
            @RequestBody
            SalesPersonRequest request

    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        salesPersonService.createSalesPerson(
                                request
                        )
                );
    }


    // =====================================================
    // UPDATE PARTY
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesPersonResponse>> updateSalesPerson(

            @PathVariable("id")
            Long id,

            @Valid
            @RequestBody
            SalesPersonRequest request

    ) {

        return ResponseEntity.ok(
                salesPersonService.updateSalesPerson(
                        id,
                        request
                )
        );
    }


    // =====================================================
    // GET PARTY BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesPersonResponse>> getSalesPersonById(

            @PathVariable("id")
            Long id

    ) {

        return ResponseEntity.ok(
                salesPersonService.getSalesPersonById(
                        id
                )
        );
    }


    // =====================================================
    // GET ALL PARTIES
    // =====================================================

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SalesPersonResponse>>> getAllSalespersons(

            @RequestParam(value = "search", required = false)
            String search,

            @RequestParam(value = "salesPersonType", required = false)
            SalesPersonType salesPersonType,

            @RequestParam(value = "status", required = false)
            Status status,

            Pageable pageable

    ) {

        return ResponseEntity.ok(
                salesPersonService.getAllSalesPersons(
                        search,
                        salesPersonType,
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
                salesPersonService.deleteSalesPerson(
                        id
                )
        );
    }
}
