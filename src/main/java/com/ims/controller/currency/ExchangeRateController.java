package com.ims.controller.currency;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.exchange.ExchangeRateRequestDTO;
import com.ims.dtos.exchange.ExchangeRateResponseDTO;
import com.ims.service.serviceInterface.currency.ExchangeRateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/exchange-rates")
@RequiredArgsConstructor
public class ExchangeRateController {

    private final ExchangeRateService exchangeRateService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ApiResponse<ExchangeRateResponseDTO>> create(
            @Valid @RequestBody ExchangeRateRequestDTO dto) {
        return ResponseEntity.ok(exchangeRateService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExchangeRateResponseDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody ExchangeRateRequestDTO dto) {
        return ResponseEntity.ok( exchangeRateService.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExchangeRateResponseDTO>> getById
            (@PathVariable Long id) {
        return ResponseEntity.ok( exchangeRateService.getById(id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ExchangeRateResponseDTO>>> getAll(
            @RequestParam(required = false) String fromCurrencyCode,
            @RequestParam(required = false) String toCurrencyCode,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20, sort = "effectiveDate")
            Pageable pageable) {

        return ResponseEntity.ok(exchangeRateService.getAll(
                fromCurrencyCode,
                toCurrencyCode,
                fromDate,
                toDate,
                active,
                pageable
        ));
    }

    @GetMapping("/lookup")
    public ResponseEntity<ApiResponse<ExchangeRateResponseDTO>> getRate(
            @RequestParam Long fromCurrencyId,
            @RequestParam Long toCurrencyId,
            @RequestParam(required = false) LocalDate date) {

        return ResponseEntity.ok(
                exchangeRateService.
                        getRate(fromCurrencyId, toCurrencyId, date));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<ApiResponse<Void>> delete
            (@PathVariable Long id) {
        return ResponseEntity.ok(exchangeRateService.delete(id));
    }
}
