 package com.ims.controller.company;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.company.CompanyCreateRequest;
import com.ims.dtos.company.CompanyResponse;
import com.ims.dtos.company.CompanySearchRequest;
import com.ims.dtos.company.CompanyUpdateRequest;
import com.ims.enums.CompanyStatus;
import com.ims.service.serviceInterface.company.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;


    // =====================================================
    // CREATE
    // =====================================================

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<CompanyResponse>> createCompany(

            @Valid
            @RequestPart(
                    value = "data",
                    required = true
            )
            CompanyCreateRequest request,

            @RequestPart(
                    value = "logo",
                    required = false
            )
            MultipartFile logo,

            @RequestPart(
                    value = "signature",
                    required = false
            )
            MultipartFile signature
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        companyService.createCompany(
                                request,
                                logo,
                                signature
                        )
                );
    }


    // =====================================================
    // GET BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                companyService.getCompanyById(id)
        );
    }


    // =====================================================
    // GET ALL
    // =====================================================

    @GetMapping
    public ResponseEntity<
            ApiResponse<PageResponse<CompanyResponse>>
            > getAllCompanies(

            @RequestParam(
                    required = false,
                    defaultValue = ""
            )
            String search,

            @RequestParam(
                    required = false
            )
            String companyName,

            @RequestParam(
                    required = false
            )
            String companyCode,

            @RequestParam(
                    required = false
            )
            String gstNumber,

            @RequestParam(
                    required = false
            )
            String panNumber,

            @RequestParam(
                    required = false
            )
            String phone,

            @RequestParam(
                    required = false
            )
            String email,

            @RequestParam(
                    required = false
            )
            String city,

            @RequestParam(
                    required = false
            )
            String state,

            @RequestParam(
                    required = false
            )
            CompanyStatus status,

            @RequestParam(
                    required = false
            )
            Boolean active,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "10"
            )
            int size,

            @RequestParam(
                    defaultValue = "id"
            )
            String sortBy,

            @RequestParam(
                    defaultValue = "desc"
            )
            String sortDirection
    ) {

        CompanySearchRequest request =
                new CompanySearchRequest();

        request.setSearch(search);
        request.setCompanyName(companyName);
        request.setCompanyCode(companyCode);
        request.setGstNumber(gstNumber);
        request.setPanNumber(panNumber);
        request.setPhone(phone);
        request.setEmail(email);
        request.setCity(city);
        request.setState(state);
        request.setStatus(status);
        request.setActive(active);

        Sort.Direction direction =
                sortDirection.equalsIgnoreCase("asc")
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                direction,
                                sortBy
                        )
                );

        return ResponseEntity.ok(
                companyService.getAllCompanies(
                        request,
                        pageable
                )
        );
    }


    // =====================================================
    // UPDATE
    // =====================================================

    @PutMapping(
            value = "/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<CompanyResponse>> updateCompany(

            @PathVariable Long id,

            @Valid
            @RequestPart(
                    value = "data",
                    required = true
            )
            CompanyUpdateRequest request,

            @RequestPart(
                    value = "logo",
                    required = false
            )
            MultipartFile logo,

            @RequestPart(
                    value = "signature",
                    required = false
            )
            MultipartFile signature
    ) {

        return ResponseEntity.ok(
                companyService.updateCompany(
                        id,
                        request,
                        logo,
                        signature
                )
        );
    }


    // =====================================================
    // DELETE
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                companyService.deleteCompany(id)
        );
    }
}
