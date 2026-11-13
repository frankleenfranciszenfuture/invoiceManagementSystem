package com.ims.service.impl.invoice;

import com.ims.common.ApiResponse;
import com.ims.dtos.invoice.InvoiceResponse;
import com.ims.entity.InvoiceEntity;
import com.ims.entity.InvoiceItemEntity;
import com.ims.entity.SalesOrderEntity;
import com.ims.entity.SalesOrderItemEntity;
import com.ims.enums.InvoicePartyType;
import com.ims.enums.InvoiceSourceType;
import com.ims.enums.InvoiceStatus;
import com.ims.enums.InvoiceType;
import com.ims.enums.SaleOrderStatus;
import com.ims.mapper.invoice.InvoiceMapper;
import com.ims.repository.InvoiceRepository;
import com.ims.repository.SaleOrderRepository;
import com.ims.service.serviceInterface.invoice.InvoiceNumberService;
import com.ims.service.serviceInterface.invoice.SalesOrderInvoiceService;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesOrderInvoiceServiceImpl
        implements SalesOrderInvoiceService {

    private final SaleOrderRepository saleOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceNumberService invoiceNumberService;
    private final InvoiceMapper invoiceMapper;

    // =====================================================
    // CONVERT SALES ORDER TO INVOICE
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<InvoiceResponse> convertSalesOrderToInvoice(
            Long salesOrderId
    ) {

        // 1. Lock and retrieve the sales order.
        SalesOrderEntity order = saleOrderRepository
                .findActiveByIdForUpdate(salesOrderId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Sales order not found with ID: "
                                        + salesOrderId
                        )
                );

        // 2. Prevent duplicate conversion.
        if (invoiceRepository.existsBySalesOrder_Id(salesOrderId)) {
            throw new IllegalStateException(
                    "An invoice has already been generated for sales order: "
                            + order.getOrderNo()
            );
        }

        // 3. Validate sales order status.
        validateSalesOrderStatus(order);

        // 4. Validate party type.
        InvoicePartyType partyType = mapPartyType(order);

        // 5. Generate sales invoice number.
        String invoiceNumber =
                invoiceNumberService.generateSaleInvoiceNumber();

        // 6. Build invoice.
        LocalDate conversionDate = LocalDate.now();

        InvoiceEntity invoice = InvoiceEntity.builder()

                // Invoice information
                .invoiceNumber(invoiceNumber)
                .invoiceType(InvoiceType.SALE_INVOICE)

                // Customer / Party
                .partyType(partyType)
                .customer(order.getCustomer())
                .party(order.getParty())

                // Source order
                .sourceType(InvoiceSourceType.SALES_ORDER)
                .salesOrder(order)

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

        // 7. Copy sales order items.
        List<InvoiceItemEntity> invoiceItems = new ArrayList<>();

        if (order.getItems() != null) {

            for (SalesOrderItemEntity sourceItem : order.getItems()) {

                InvoiceItemEntity invoiceItem =
                        mapSalesOrderItem(sourceItem, invoice);

                invoiceItems.add(invoiceItem);
            }
        }

        invoice.setInvoiceItems(invoiceItems);

        // 8. Save invoice and invoice items.
        InvoiceEntity savedInvoice = invoiceRepository.save(invoice);

        // 9. Return invoice response.
        return ApiResponse.success(
                invoiceMapper.toResponse(savedInvoice),
                "Sales order converted into invoice successfully."
        );
    }

    // =====================================================
    // VALIDATE SALES ORDER STATUS
    // =====================================================

    private void validateSalesOrderStatus(SalesOrderEntity order) {

        SaleOrderStatus status = order.getSalesOrderStatus();

        if (status != SaleOrderStatus.CONFIRMED
                && status != SaleOrderStatus.DISPATCHED) {

            throw new IllegalStateException(
                    "Only CONFIRMED or DISPATCHED sales orders "
                            + "can be converted into invoices. Current status: "
                            + status
            );
        }
    }

    // =====================================================
    // MAP PARTY TYPE
    // =====================================================

    private InvoicePartyType mapPartyType(SalesOrderEntity order) {

        if (order.getPartyType() == null) {
            throw new IllegalStateException(
                    "Sales order party type is required."
            );
        }

        try {
            return InvoicePartyType.valueOf(
                    order.getPartyType().name()
            );
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "Unsupported sales order party type: "
                            + order.getPartyType()
            );
        }
    }

    // =====================================================
    // MAP SALES ORDER ITEM TO INVOICE ITEM
    // =====================================================

    private InvoiceItemEntity mapSalesOrderItem(
            SalesOrderItemEntity source,
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