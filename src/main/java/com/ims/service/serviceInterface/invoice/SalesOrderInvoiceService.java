package com.ims.service.serviceInterface.invoice;

import com.ims.common.ApiResponse;
import com.ims.dtos.invoice.InvoiceResponse;

public interface SalesOrderInvoiceService {

    ApiResponse<InvoiceResponse> convertSalesOrderToInvoice(
            Long salesOrderId
    );
}
