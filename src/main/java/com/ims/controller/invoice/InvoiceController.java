package com.ims.controller.invoice;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.invoice.InvoiceCreateRequest;
import com.ims.dtos.invoice.InvoiceResponse;
import com.ims.dtos.invoice.InvoiceSearchRequest;
import com.ims.dtos.invoice.InvoiceUpdateRequest;
import com.ims.service.serviceInterface.invoice.InvoiceNumberService;
import com.ims.service.serviceInterface.invoice.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final InvoiceNumberService invoiceNumberService;

    // =====================================================
    // GENERATE INVOICE NUMBER
    // =====================================================

    @GetMapping("/generate")
    public ApiResponse<InvoiceResponse> generateInvoiceNumber() {

        InvoiceResponse response = new InvoiceResponse();

        response.setInvoiceNumber(
                invoiceNumberService.generateInvoiceNumber()
        );

        return ApiResponse.success(
                response,
                "Invoice number generated successfully."

        );
    }


    // =====================================================
    // CREATE
    // =====================================================

    @PostMapping
    public ApiResponse<InvoiceResponse> createInvoice(

            @Valid
            @RequestBody
            InvoiceCreateRequest request
    ) {

        return invoiceService.createInvoice(
                request
        );
    }


    // =====================================================
    // GET BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ApiResponse<InvoiceResponse> getInvoiceById(

            @PathVariable
            Long id
    ) {

        return invoiceService.getInvoiceById(
                id
        );
    }


    // =====================================================
    // GET ALL
    // =====================================================

    @GetMapping
    public ApiResponse<PageResponse<InvoiceResponse>> getAllInvoices(

            @ModelAttribute
            InvoiceSearchRequest request,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "20"
            )
            int size
    ) {

        Pageable pageable =
                PageRequest.of(
                        page,
                        size
                );

        return invoiceService.getAllInvoices(
                request,
                pageable
        );
    }


    // =====================================================
    // UPDATE
    // =====================================================

    @PutMapping("/{id}")
    public ApiResponse<InvoiceResponse> updateInvoice(

            @PathVariable
            Long id,

            @Valid
            @RequestBody
            InvoiceUpdateRequest request
    ) {

        return invoiceService.updateInvoice(
                id,
                request
        );
    }


    // =====================================================
    // CANCEL
    // =====================================================

    @PutMapping("/{id}/cancel")
    public ApiResponse<InvoiceResponse> cancelInvoice(

            @PathVariable
            Long id
    ) {

        return invoiceService.cancelInvoice(
                id
        );
    }


    // =====================================================
    // DELETE / DEACTIVATE
    // =====================================================

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteInvoice(

            @PathVariable
            Long id
    ) {

        return invoiceService.deleteInvoice(
                id
        );
    }
}