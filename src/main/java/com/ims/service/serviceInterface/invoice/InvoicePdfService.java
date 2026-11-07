package com.ims.service.serviceInterface.invoice;


public interface InvoicePdfService {

    byte[] generateInvoicePdf(Long invoiceId);
}