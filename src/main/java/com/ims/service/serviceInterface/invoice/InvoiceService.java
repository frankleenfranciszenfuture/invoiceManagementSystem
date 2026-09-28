package com.ims.service.serviceInterface.invoice;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.invoice.InvoiceCreateRequest;
import com.ims.dtos.invoice.InvoiceResponse;
import com.ims.dtos.invoice.InvoiceSearchRequest;
import com.ims.dtos.invoice.InvoiceUpdateRequest;
import org.springframework.data.domain.Pageable;

public interface InvoiceService {

    // =====================================================
    // CREATE
    // =====================================================

    ApiResponse<InvoiceResponse> createInvoice(
            InvoiceCreateRequest request
    );


    // =====================================================
    // GET BY ID
    // =====================================================

    ApiResponse<InvoiceResponse> getInvoiceById(
            Long id
    );


    // =====================================================
    // GET ALL
    // =====================================================

    ApiResponse<PageResponse<InvoiceResponse>> getAllInvoices(
            InvoiceSearchRequest request,
            Pageable pageable
    );


    // =====================================================
    // UPDATE
    // =====================================================

    ApiResponse<InvoiceResponse> updateInvoice(
            Long id,
            InvoiceUpdateRequest request
    );


    // =====================================================
    // CANCEL
    // =====================================================

    ApiResponse<InvoiceResponse> cancelInvoice(
            Long id
    );


    // =====================================================
    // DELETE
    // =====================================================

    ApiResponse<Void> deleteInvoice(
            Long id
    );

}