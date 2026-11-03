package com.ims.controller.payment;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.payment.PaymentRequestDTO;
import com.ims.dtos.payment.PaymentResponseDTO;
import com.ims.dtos.payment.PaymentReversalRequestDTO;
import com.ims.enums.PaymentDirection;
import com.ims.enums.PaymentMethod;
import com.ims.enums.PaymentStatus;
import com.ims.enums.PaymentType;
import com.ims.service.serviceInterface.payment.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // =====================================================
    // CREATE PAYMENT
    // POST /payments
    // =====================================================

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> createPayment(
            @Valid @RequestBody PaymentRequestDTO request
    ) {

        PaymentResponseDTO response =
                paymentService.createPayment(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        response,
                        "Payment recorded successfully"
                ));
    }

    // =====================================================
    // GET PAYMENT BY ID
    // GET /payments/{id}
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> getPaymentById(
            @PathVariable Long id
    ) {

        PaymentResponseDTO response =
                paymentService.getPaymentById(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        response,
                        "Payment fetched successfully"
                )
        );
    }

    // =====================================================
    // GET ALL PAYMENTS WITH FILTERS
    // GET /payments
    // =====================================================

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponseDTO>>>
    getAllPayments(

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "10") int size,

            @RequestParam(defaultValue = "paymentDate") String sortBy,

            @RequestParam(defaultValue = "desc") String sortDirection,

            @RequestParam(required = false) PaymentType paymentType,

            @RequestParam(required = false) PaymentDirection paymentDirection,

            @RequestParam(required = false) PaymentMethod paymentMethod,

            @RequestParam(required = false) PaymentStatus paymentStatus,

            @RequestParam(required = false) Long sourceId,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate,

            @RequestParam(required = false) String search
    ) {

        PageResponse<PaymentResponseDTO> response =
                paymentService.getAllPayments(
                        page,
                        size,
                        sortBy,
                        sortDirection,
                        paymentType,
                        paymentDirection,
                        paymentMethod,
                        paymentStatus,
                        sourceId,
                        fromDate,
                        toDate,
                        search
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response,
                        "Payments fetched successfully"
                )
        );
    }

    // =====================================================
    // GET PAYMENTS BY SOURCE
    // GET /payments/source/SALES/1
    // =====================================================

    @GetMapping("/source/{paymentType}/{sourceId}")
    public ResponseEntity<ApiResponse<List<PaymentResponseDTO>>>
    getPaymentsBySource(
            @PathVariable PaymentType paymentType,
            @PathVariable Long sourceId
    ) {

        List<PaymentResponseDTO> response =
                paymentService.getPaymentsBySource(
                        paymentType,
                        sourceId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response,
                        "Source payments fetched successfully"
                )
        );
    }

    // =====================================================
    // REVERSE PAYMENT
    // POST /payments/{id}/reverse?reason=...
    // =====================================================

    @PostMapping("/{id}/reverse")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> reversePayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentReversalRequestDTO request
    ) {

        PaymentResponseDTO response =
                paymentService.reversePayment(
                        id,
                        request.getReversalReason()
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response,
                        "Payment reversed successfully"
                )
        );
    }


}