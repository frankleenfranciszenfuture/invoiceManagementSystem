package com.ims.service.serviceInterface.payment;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.payment.PaymentFilterDTO;
import com.ims.dtos.payment.PaymentRequestDTO;
import com.ims.dtos.payment.PaymentResponseDTO;

import org.springframework.data.domain.Pageable;

public interface PaymentService {

    /**
     * Create a new payment.
     */
    ApiResponse<PaymentResponseDTO> createPayment(
            PaymentRequestDTO request
    );

    /**
     * Get payment details by ID.
     */
    ApiResponse<PaymentResponseDTO> getPaymentById(
            Long paymentId
    );

    /**
     * Get all payments with dynamic filters and pagination.
     */
    ApiResponse<PageResponse<PaymentResponseDTO>> getAllPayments(
            PaymentFilterDTO filter,
            Pageable pageable
    );

    /**
     * Complete a pending payment.
     *
     * For example, clear a pending cheque payment.
     */
    ApiResponse<PaymentResponseDTO> completePayment(
            Long paymentId
    );

    /**
     * Cancel a payment.
     *
     * Completed payments must reverse their accounting
     * and bank transaction effects.
     */
    ApiResponse<PaymentResponseDTO> cancelPayment(
            Long paymentId
    );
}
