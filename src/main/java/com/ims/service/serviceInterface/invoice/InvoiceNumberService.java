package com.ims.service.serviceInterface.invoice;


public interface InvoiceNumberService {

    String generatePurchaseNumber();

    String generatePurchaseInvoiceNumber();

    String generateInvoiceNumber();

    String generateSaleNumber();

    String generateSaleInvoiceNumber();

}