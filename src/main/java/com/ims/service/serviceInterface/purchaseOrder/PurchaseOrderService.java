package com.ims.service.serviceInterface.purchaseOrder;


import com.ims.dtos.purchaseOrder.PurchaseOrderGoodsReceiptRequest;
import com.ims.dtos.purchaseOrder.PurchaseOrderGoodsReceiptResponse;
import com.ims.dtos.purchaseOrder.PurchaseOrderRequest;
import com.ims.dtos.purchaseOrder.PurchaseOrderResponse;
import com.ims.dtos.purchaseOrder.PurchaseOrderSearchRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PurchaseOrderService {

    // Create a new purchase order in DRAFT status
    PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request);

    // Get one purchase order with its items and related details
    PurchaseOrderResponse getPurchaseOrderById(Long id);

    // Get purchase orders using filters and pagination
    Page<PurchaseOrderResponse> getAllPurchaseOrders(
            PurchaseOrderSearchRequest request,
            Pageable pageable
    );

    // Update an existing DRAFT purchase order
    PurchaseOrderResponse updatePurchaseOrder(
            Long id,
            PurchaseOrderRequest request
    );

    // Confirm a DRAFT purchase order
    PurchaseOrderResponse confirmPurchaseOrder(Long id);

    // Cancel a purchase order before any goods have been received
    PurchaseOrderResponse cancelPurchaseOrder(Long id);

    // Soft-delete a purchase order when it has no goods receipts
    void deletePurchaseOrder(Long id);

    // Receive goods against a confirmed purchase order
    PurchaseOrderGoodsReceiptResponse createGoodsReceipt(
            PurchaseOrderGoodsReceiptRequest request
    );

    // Get one goods receipt
    PurchaseOrderGoodsReceiptResponse getGoodsReceiptById(Long receiptId);

    // Get goods receipts for a purchase order
    List<PurchaseOrderGoodsReceiptResponse> getGoodsReceiptsByPurchaseOrderId(
            Long purchaseOrderId
    );
}