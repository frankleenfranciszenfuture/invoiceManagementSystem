package com.ims.utils.validation;

import com.ims.dtos.invoice.InvoiceCreateRequest;
import com.ims.dtos.invoice.InvoiceItemRequest;
import com.ims.dtos.invoice.InvoiceUpdateRequest;
import com.ims.entity.InvoiceEntity;
import com.ims.exception.BadRequestException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InvoiceValidation {

    private final InvoiceRepository invoiceRepository;

    // =====================================================
    // CREATE VALIDATION
    // =====================================================

    public void validateCreate(
            InvoiceCreateRequest request
    ) {

        // -------------------------------------------------
        // REQUEST
        // -------------------------------------------------

        if (request == null) {

            throw new BadRequestException(
                    "Invoice request is required."
            );
        }

        // -------------------------------------------------
        // INVOICE TYPE
        // -------------------------------------------------

        if (request.getInvoiceType() == null) {

            throw new BadRequestException(
                    "Invoice type is required."
            );
        }

        // -------------------------------------------------
        // CUSTOMER
        // -------------------------------------------------

        if (request.getCustomerId() == null) {

            throw new BadRequestException(
                    "Customer ID is required."
            );
        }

        // -------------------------------------------------
        // INVOICE DATE
        // -------------------------------------------------

        if (request.getInvoiceDate() == null) {

            throw new BadRequestException(
                    "Invoice date is required."
            );
        }

        // -------------------------------------------------
        // ITEMS
        // -------------------------------------------------

        validateItems(
                request.getInvoiceItems()
        );
    }

    // =====================================================
    // UPDATE VALIDATION
    // =====================================================

    public void validateUpdate(
            InvoiceUpdateRequest request
    ) {

        // -------------------------------------------------
        // REQUEST
        // -------------------------------------------------

        if (request == null) {

            throw new BadRequestException(
                    "Invoice request is required."
            );
        }

        // -------------------------------------------------
        // INVOICE TYPE
        // -------------------------------------------------

        if (request.getInvoiceType() == null) {

            throw new BadRequestException(
                    "Invoice type is required."
            );
        }

        // -------------------------------------------------
        // CUSTOMER
        // -------------------------------------------------

        if (request.getCustomerId() == null) {

            throw new BadRequestException(
                    "Customer ID is required."
            );
        }

        // -------------------------------------------------
        // INVOICE DATE
        // -------------------------------------------------

        if (request.getInvoiceDate() == null) {

            throw new BadRequestException(
                    "Invoice date is required."
            );
        }

        // -------------------------------------------------
        // ITEMS
        // -------------------------------------------------

        validateItems(
                request.getInvoiceItems()
        );
    }

    // =====================================================
    // ITEM VALIDATION
    // =====================================================

    private void validateItems(
            java.util.List<InvoiceItemRequest> items
    ) {

        // -------------------------------------------------
        // ITEMS REQUIRED
        // -------------------------------------------------

        if (items == null || items.isEmpty()) {

            throw new BadRequestException(
                    "At least one invoice item is required."
            );
        }

        // -------------------------------------------------
        // VALIDATE EACH ITEM
        // -------------------------------------------------

        for (int i = 0; i < items.size(); i++) {

            InvoiceItemRequest item =
                    items.get(i);

            validateItem(
                    item,
                    i
            );
        }
    }

    // =====================================================
    // SINGLE ITEM VALIDATION
    // =====================================================

    private void validateItem(
            InvoiceItemRequest item,
            int index
    ) {

        String itemPrefix =
                "Invoice item " + (index + 1) + ": ";

        // -------------------------------------------------
        // ITEM
        // -------------------------------------------------

        if (item == null) {

            throw new BadRequestException(
                    itemPrefix +
                            "item is required."
            );
        }

        // -------------------------------------------------
        // PRODUCT
        // -------------------------------------------------

        if (item.getProductId() == null) {

            throw new BadRequestException(
                    itemPrefix +
                            "Product ID is required."
            );
        }

        // -------------------------------------------------
        // QUANTITY
        // -------------------------------------------------

        if (item.getQuantity() == null) {

            throw new BadRequestException(
                    itemPrefix +
                            "Quantity is required."
            );
        }

        if (item.getQuantity().signum() <= 0) {

            throw new BadRequestException(
                    itemPrefix +
                            "Quantity must be greater than zero."
            );
        }

        // -------------------------------------------------
        // UNIT PRICE
        // -------------------------------------------------

        if (item.getUnitPrice() == null) {

            throw new BadRequestException(
                    itemPrefix +
                            "Unit price is required."
            );
        }

        if (item.getUnitPrice().signum() < 0) {

            throw new BadRequestException(
                    itemPrefix +
                            "Unit price cannot be negative."
            );
        }

        // -------------------------------------------------
        // DISCOUNT
        // -------------------------------------------------

        if (item.getDiscountAmount() != null &&
                item.getDiscountAmount().signum() < 0) {

            throw new BadRequestException(
                    itemPrefix +
                            "Discount amount cannot be negative."
            );
        }
    }

    // =====================================================
    // VALIDATE EXISTING INVOICE
    // =====================================================

    public InvoiceEntity validateInvoice(
            Long invoiceId
    ) {

        // -------------------------------------------------
        // INVOICE ID
        // -------------------------------------------------

        if (invoiceId == null) {

            throw new BadRequestException(
                    "Invoice ID is required."
            );
        }

        // -------------------------------------------------
        // FIND ACTIVE INVOICE
        // -------------------------------------------------

        return invoiceRepository
                .findByIdAndActiveTrue(invoiceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Invoice not found."
                        )
                );
    }
}
