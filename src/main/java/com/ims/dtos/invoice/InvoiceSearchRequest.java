package com.ims.dtos.invoice;

import com.ims.enums.InvoiceStatus;
import com.ims.enums.InvoiceType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InvoiceSearchRequest {

    private String invoiceNumber;

    private InvoiceType invoiceType;

    private InvoiceStatus status;

    private LocalDate fromDate;

    private LocalDate toDate;

    private Long saleId;

    private Long purchaseId;

    private Long stockTransferId;

    private BigDecimal minGrandTotal;

    private BigDecimal maxGrandTotal;
}
