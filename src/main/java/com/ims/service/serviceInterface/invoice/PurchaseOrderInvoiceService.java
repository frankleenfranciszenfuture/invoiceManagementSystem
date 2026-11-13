package com.ims.service.serviceInterface.invoice;


import com.ims.common.ApiResponse;
import com.ims.dtos.invoice.InvoiceResponse;

public interface PurchaseOrderInvoiceService {

    ApiResponse<InvoiceResponse> convertPurchaseOrderToInvoice(
            Long purchaseOrderId
    );
}
