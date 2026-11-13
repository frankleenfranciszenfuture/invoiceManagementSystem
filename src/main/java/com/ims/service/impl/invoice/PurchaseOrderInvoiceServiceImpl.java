package com.ims.service.impl.invoice;

import com.ims.common.ApiResponse;
import com.ims.dtos.invoice.InvoiceResponse;
import com.ims.entity.InvoiceEntity;
import com.ims.entity.InvoiceItemEntity;
import com.ims.entity.PurchaseOrderEntity;
import com.ims.entity.PurchaseOrderItemEntity;
import com.ims.enums.InvoicePartyType;
import com.ims.enums.InvoiceSourceType;
import com.ims.enums.InvoiceStatus;
import com.ims.enums.InvoiceType;
import com.ims.enums.PurchaseOrderStatus;
import com.ims.mapper.invoice.InvoiceMapper;
import com.ims.repository.InvoiceRepository;
import com.ims.repository.PurchaseOrderRepository;
import com.ims.service.serviceInterface.invoice.InvoiceNumberService;
import com.ims.service.serviceInterface.invoice.PurchaseOrderInvoiceService;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseOrderInvoiceServiceImpl
        implements PurchaseOrderInvoiceService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceNumberService invoiceNumberService;
    private final InvoiceMapper invoiceMapper;

    // =====================================================
    // CONVERT PURCHASE ORDER TO INVOICE
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<InvoiceResponse> convertPurchaseOrderToInvoice(
            Long purchaseOrderId) {

        // 1. Lock and retrieve the purchase order.
        PurchaseOrderEntity order = purchaseOrderRepository
                .findActiveByIdForUpdate(purchaseOrderId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Purchase order not found with ID: "
                                        + purchaseOrderId
                        )
                );

        // 2. Prevent duplicate conversion.
        if (invoiceRepository.existsByPurchaseOrder_Id(purchaseOrderId)) {
            throw new IllegalStateException(
                    "An invoice has already been generated for purchase order: "
                            + order.getOrderNo()
            );
        }

        // 3. Validate purchase order status.
        validatePurchaseOrderStatus(order);

        // 4. Validate party type.
        InvoicePartyType partyType = mapPartyType(order);

        // 5. Generate purchase invoice number.
        String invoiceNumber =
                invoiceNumberService.generatePurchaseInvoiceNumber();

        // 6. Build invoice.
        LocalDate conversionDate = LocalDate.now();

        InvoiceEntity invoice = InvoiceEntity.builder()

                // Invoice information
                .invoiceNumber(invoiceNumber)
                .invoiceType(InvoiceType.PURCHASE_INVOICE)

                // Customer / Party
                .partyType(partyType)
                .customer(order.getCustomer())
                .party(order.getParty())

                // Source order
                .sourceType(InvoiceSourceType.PURCHASE_ORDER)
                .purchaseOrder(order)

                // Dates
                .invoiceDate(conversionDate)
                .dueDate(conversionDate)

                // Financial information
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .taxAmount(order.getTotalTaxAmount())
                .shippingAmount(order.getShippingAmount())
                .grandTotal(order.getGrandTotal())

                // Currency
                .currency(order.getCurrency())
                .exchangeRate(order.getExchangeRate())

                // Status
                .status(InvoiceStatus.DRAFT)

                // Other information
                .notes(order.getNotes())
                .termsAndConditions("Due on Receipt")

                // Items
                .invoiceItems(new ArrayList<>())

                .build();

        // 7. Copy purchase order items.
        List<InvoiceItemEntity> invoiceItems = new ArrayList<>();

        if (order.getItems() != null) {

            for (PurchaseOrderItemEntity sourceItem : order.getItems()) {

                InvoiceItemEntity invoiceItem =
                        mapPurchaseOrderItem(sourceItem, invoice);

                invoiceItems.add(invoiceItem);
            }
        }

        invoice.setInvoiceItems(invoiceItems);

        // 8. Save invoice and invoice items.
        // CascadeType.ALL saves the invoice items automatically.
        InvoiceEntity savedInvoice = invoiceRepository.save(invoice);

        // 9. Return invoice response.
        return ApiResponse.success(
                invoiceMapper.toResponse(savedInvoice),
                "Purchase order converted into invoice successfully."
        );
    }

    // =====================================================
    // VALIDATE PURCHASE ORDER STATUS
    // =====================================================

    private void validatePurchaseOrderStatus(PurchaseOrderEntity order) {

        PurchaseOrderStatus status = order.getPurchaseOrderStatus();

        if (status != PurchaseOrderStatus.CONFIRMED
                && status != PurchaseOrderStatus.RECEIVED) {

            throw new IllegalStateException(
                    "Only CONFIRMED or RECEIVED purchase orders "
                            + "can be converted into invoices. Current status: "
                            + status
            );
        }
    }

    // =====================================================
    // MAP PARTY TYPE
    // =====================================================

    private InvoicePartyType mapPartyType(PurchaseOrderEntity order) {

        if (order.getPartyType() == null) {
            throw new IllegalStateException(
                    "Purchase order party type is required."
            );
        }

        try {
            return InvoicePartyType.valueOf(
                    order.getPartyType().name()
            );
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "Unsupported purchase order party type: "
                            + order.getPartyType()
            );
        }
    }

    // =====================================================
    // MAP PURCHASE ORDER ITEM TO INVOICE ITEM
    // =====================================================

    private InvoiceItemEntity mapPurchaseOrderItem(
            PurchaseOrderItemEntity source,
            InvoiceEntity invoice
    ) {

        return InvoiceItemEntity.builder()

                .invoice(invoice)

                // Product
                .product(source.getProduct())
                .description(source.getDescription())

                // Unit and size
                .unit(source.getUnit())
                .size(source.getSize())

                // Quantity
                .quantity(source.getQuantity())

                // Prices
                .baseUnitPrice(source.getBaseUnitPrice())
                .unitPrice(source.getUnitPrice())

                // Amounts
                .grossAmount(source.getLineAmount())
                .discountAmount(source.getDiscountAmount())
                .taxableAmount(source.getTaxableAmount())

                // Tax master
                .taxMaster(source.getTaxMaster())

                // Tax percentages
                .taxPercentage(source.getTaxRate())
                .cgstPercentage(source.getCgstRate())
                .sgstPercentage(source.getSgstRate())
                .igstPercentage(source.getIgstRate())

                // Tax amounts
                .cgstAmount(source.getCgstAmount())
                .sgstAmount(source.getSgstAmount())
                .igstAmount(source.getIgstAmount())
                .taxAmount(source.getTotalTaxAmount())

                // Final amount
                .totalAmount(source.getTotalAmount())

                .build();
    }
}