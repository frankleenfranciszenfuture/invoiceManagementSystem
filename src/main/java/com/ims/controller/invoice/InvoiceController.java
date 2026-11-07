package com.ims.controller.invoice;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.invoice.InvoiceCreateRequest;
import com.ims.dtos.invoice.InvoiceResponse;
import com.ims.dtos.invoice.InvoiceSearchRequest;
import com.ims.dtos.invoice.InvoiceUpdateRequest;
import com.ims.service.serviceInterface.email.EmailService;
import com.ims.service.serviceInterface.invoice.InvoiceNumberService;
import com.ims.service.serviceInterface.invoice.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final InvoiceNumberService invoiceNumberService;
    private final EmailService emailService;
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


    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<InvoiceResponse>> approveInvoice(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                invoiceService.approveInvoice(id)
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

    // =====================================================
// SEND INVOICE EMAIL WITH PDF ATTACHMENT
// =====================================================

    @PostMapping(
            value = "/{id}/send-email",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ApiResponse<Void> sendInvoiceEmail(

            @PathVariable
            Long id,

            @RequestParam("toEmail")
            String toEmail,

            @RequestParam(value = "subject", required = false)
            String subject,

            @RequestParam(value = "message", required = false)
            String message,

            @RequestParam("file")
            MultipartFile file
    ) {

        // Verify invoice exists
        ApiResponse<InvoiceResponse> response =
                invoiceService.getInvoiceById(id);

        if (response == null || response.getData() == null) {
            throw new IllegalArgumentException(
                    "Invoice not found with ID: " + id
            );
        }

        InvoiceResponse invoice = response.getData();

        // Send email with frontend-generated PDF
        emailService.sendInvoiceEmail(
                toEmail,
                subject,
                message,
                invoice.getInvoiceNumber(),
                file
        );
        // Update invoice status only after successful email delivery
        invoiceService.markInvoiceAsSent(id);

        return ApiResponse.success(
                null,
                "Invoice email submitted successfully."
        );
    }
}