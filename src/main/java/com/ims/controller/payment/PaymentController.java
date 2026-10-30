package com.ims.controller.payment;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;

import com.ims.dtos.payment.PaymentFilterDTO;
import com.ims.dtos.payment.PaymentRequestDTO;
import com.ims.dtos.payment.PaymentResponseDTO;

import com.ims.service.serviceInterface.payment.PaymentService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.format.annotation.DateTimeFormat;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // ---------------------------------------------------------
    // CREATE PAYMENT
    // ---------------------------------------------------------

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> createPayment(
            @Valid @RequestBody PaymentRequestDTO request
    ) {

        ApiResponse<PaymentResponseDTO> response =
                paymentService.createPayment(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ---------------------------------------------------------
    // GET PAYMENT BY ID
    // ---------------------------------------------------------

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> getPaymentById(
            @PathVariable Long id
    ) {

        ApiResponse<PaymentResponseDTO> response =
                paymentService.getPaymentById(id);

        return ResponseEntity.ok(response);
    }

    // ---------------------------------------------------------
    // GET ALL PAYMENTS WITH FILTERS AND PAGINATION
    // ---------------------------------------------------------

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponseDTO>>>
    getAllPayments(

            @ModelAttribute PaymentFilterDTO filter,

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "10") int size,

            @RequestParam(defaultValue = "paymentDate") String sortBy,

            @RequestParam(defaultValue = "desc") String sortDirection
    ) {

        validatePagination(page, size);

        Pageable pageable = PageRequest.of(
                page,
                size,
                getSort(sortBy, sortDirection)
        );

        ApiResponse<PageResponse<PaymentResponseDTO>> response =
                paymentService.getAllPayments(filter, pageable);

        return ResponseEntity.ok(response);
    }

    // ---------------------------------------------------------
    // COMPLETE PENDING PAYMENT
    // ---------------------------------------------------------

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>>
    completePayment(
            @PathVariable Long id
    ) {

        ApiResponse<PaymentResponseDTO> response =
                paymentService.completePayment(id);

        return ResponseEntity.ok(response);
    }

    // ---------------------------------------------------------
    // CANCEL PAYMENT
    // ---------------------------------------------------------

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>>
    cancelPayment(
            @PathVariable Long id
    ) {

        ApiResponse<PaymentResponseDTO> response =
                paymentService.cancelPayment(id);

        return ResponseEntity.ok(response);
    }

    // ---------------------------------------------------------
    // PAGINATION VALIDATION
    // ---------------------------------------------------------

    private void validatePagination(int page, int size) {

        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page number cannot be negative"
            );
        }

        if (size <= 0 || size > 100) {
            throw new IllegalArgumentException(
                    "Page size must be between 1 and 100"
            );
        }
    }

    // ---------------------------------------------------------
    // SORTING
    // ---------------------------------------------------------

    private Sort getSort(
            String sortBy,
            String sortDirection
    ) {

        // Whitelist entity properties to prevent invalid sort paths.
        if (!java.util.Set.of(
                "paymentDate",
                "paymentNumber",
                "amount",
                "createdAt",
                "updatedAt"
        ).contains(sortBy)) {

            throw new IllegalArgumentException(
                    "Invalid payment sort field: " + sortBy
            );
        }

        Sort.Direction direction =
                "asc".equalsIgnoreCase(sortDirection)
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        return Sort.by(direction, sortBy);
    }
}
