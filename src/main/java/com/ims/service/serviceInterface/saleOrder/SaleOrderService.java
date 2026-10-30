package com.ims.service.serviceInterface.saleOrder;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.saleOrder.SalesOrderRequest;
import com.ims.dtos.saleOrder.SalesOrderResponse;
import com.ims.dtos.saleOrder.SalesOrderSearchRequest;
import com.ims.entity.PaymentEntity;

import org.springframework.data.domain.Pageable;

public interface SaleOrderService {

    ApiResponse<SalesOrderResponse> createSalesOrder(
            SalesOrderRequest request
    );

    ApiResponse<SalesOrderResponse> getSalesOrderById(
            Long id
    );

    ApiResponse<PageResponse<SalesOrderResponse>> getAllSalesOrders(
            SalesOrderSearchRequest request,
            Pageable pageable
    );

    ApiResponse<SalesOrderResponse> updateSalesOrder(
            Long id,
            SalesOrderRequest request
    );

    ApiResponse<SalesOrderResponse> cancelSalesOrder(
            Long id
    );

    ApiResponse<Void> deleteSalesOrder(
            Long id
    );

    ApiResponse<SalesOrderResponse> dispatchSalesOrder(Long id);
    // Payment integration

    ApiResponse<SalesOrderResponse> confirmSalesOrder(Long id);


    void allocatePayment(PaymentEntity payment);

    void reversePayment(PaymentEntity payment);
}