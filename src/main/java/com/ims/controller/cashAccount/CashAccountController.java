package com.ims.controller.cashAccount;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.cashAccount.CashAccountRequestDTO;
import com.ims.dtos.cashAccount.CashAccountResponseDTO;
import com.ims.service.serviceInterface.cashAccount.CashAccountService;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cash-accounts")
@RequiredArgsConstructor
public class CashAccountController {

    private final CashAccountService cashAccountService;

    @PostMapping
    public ResponseEntity<ApiResponse<CashAccountResponseDTO>> create(
            @Valid @RequestBody CashAccountRequestDTO request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(cashAccountService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CashAccountResponseDTO>> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                cashAccountService.getById(id)
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CashAccountResponseDTO>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ) {

        return ResponseEntity.ok(
                cashAccountService.getAll(search, status, pageable)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CashAccountResponseDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody CashAccountRequestDTO request
    ) {

        return ResponseEntity.ok(
                cashAccountService.update(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                cashAccountService.delete(id)
        );
    }
}