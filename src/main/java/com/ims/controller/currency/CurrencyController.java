package com.ims.controller.currency;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.currency.CurrencyRequestDTO;
import com.ims.dtos.currency.CurrencyResponseDTO;
import com.ims.service.serviceInterface.currency.CurrencyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/currencies")
@RequiredArgsConstructor
public class CurrencyController {

    private final CurrencyService currencyService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ApiResponse<CurrencyResponseDTO>> create(
            @Valid @RequestBody CurrencyRequestDTO dto) {

        return ResponseEntity.ok(
        currencyService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CurrencyResponseDTO>>  update(
            @PathVariable Long id,
            @Valid @RequestBody CurrencyRequestDTO dto) {
        return ResponseEntity.ok(
                currencyService.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CurrencyResponseDTO>> getById
            (@PathVariable Long id) {
        return ResponseEntity.ok(
                currencyService.getById(id));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CurrencyResponseDTO>>>getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20, sort = "code")
            Pageable pageable) {

        return ResponseEntity.ok(
                currencyService.getAll(search, active, pageable));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        return ResponseEntity.ok( currencyService.delete(
                        id
                )
        );
    }
}
