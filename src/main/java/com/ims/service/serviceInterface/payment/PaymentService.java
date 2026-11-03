package com.ims.service.serviceInterface.payment;


import com.ims.common.PageResponse;
import com.ims.dtos.payment.PaymentRequestDTO;
import com.ims.dtos.payment.PaymentResponseDTO;
import com.ims.enums.PaymentDirection;
import com.ims.enums.PaymentMethod;
import com.ims.enums.PaymentStatus;
import com.ims.enums.PaymentType;

import java.time.LocalDate;
import java.util.List;

public interface PaymentService {

    PaymentResponseDTO createPayment(PaymentRequestDTO request);

    PaymentResponseDTO getPaymentById(Long id);

    PageResponse<PaymentResponseDTO> getAllPayments(
            int page,
            int size,
            String sortBy,
            String sortDirection,
            PaymentType paymentType,
            PaymentDirection paymentDirection,
            PaymentMethod paymentMethod,
            PaymentStatus paymentStatus,
            Long sourceId,
            LocalDate fromDate,
            LocalDate toDate,
            String search
    );

    List<PaymentResponseDTO> getPaymentsBySource(
            PaymentType paymentType,
            Long sourceId
    );

    PaymentResponseDTO reversePayment(Long id, String reason);

    
}