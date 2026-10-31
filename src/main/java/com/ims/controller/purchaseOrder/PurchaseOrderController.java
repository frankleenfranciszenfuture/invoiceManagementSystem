package com.ims.controller.purchaseOrder;

import com.ims.dtos.purchaseOrder.PurchaseOrderGoodsReceiptRequest;
import com.ims.dtos.purchaseOrder.PurchaseOrderGoodsReceiptResponse;
import com.ims.dtos.purchaseOrder.PurchaseOrderRequest;
import com.ims.dtos.purchaseOrder.PurchaseOrderResponse;
import com.ims.dtos.purchaseOrder.PurchaseOrderSearchRequest;
import com.ims.service.serviceInterface.purchaseOrder.PurchaseOrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    // =========================================================
    // CREATE PURCHASE ORDER
    // =========================================================

    @PostMapping
    public ResponseEntity<PurchaseOrderResponse> createPurchaseOrder(
            @Valid @RequestBody PurchaseOrderRequest request
    ) {

        PurchaseOrderResponse response =
                purchaseOrderService.createPurchaseOrder(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // GET PURCHASE ORDER BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponse> getPurchaseOrderById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                purchaseOrderService.getPurchaseOrderById(id)
        );
    }

    // =========================================================
    // GET ALL PURCHASE ORDERS WITH FILTERS AND PAGINATION
    // =========================================================

    @PostMapping("/search")
    public ResponseEntity<Page<PurchaseOrderResponse>> getAllPurchaseOrders(
            @RequestBody(required = false) PurchaseOrderSearchRequest request,
            @PageableDefault(
                    size = 10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ) {

        return ResponseEntity.ok(
                purchaseOrderService.getAllPurchaseOrders(
                        request,
                        pageable
                )
        );
    }

    // =========================================================
    // UPDATE PURCHASE ORDER
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponse> updatePurchaseOrder(
            @PathVariable Long id,
            @Valid @RequestBody PurchaseOrderRequest request
    ) {

        return ResponseEntity.ok(
                purchaseOrderService.updatePurchaseOrder(id, request)
        );
    }

    // =========================================================
    // CONFIRM PURCHASE ORDER
    // =========================================================

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<PurchaseOrderResponse> confirmPurchaseOrder(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                purchaseOrderService.confirmPurchaseOrder(id)
        );
    }

    // =========================================================
    // CANCEL PURCHASE ORDER
    // =========================================================

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<PurchaseOrderResponse> cancelPurchaseOrder(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                purchaseOrderService.cancelPurchaseOrder(id)
        );
    }

    // =========================================================
    // DELETE PURCHASE ORDER (SOFT DELETE)
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchaseOrder(
            @PathVariable Long id
    ) {

        purchaseOrderService.deletePurchaseOrder(id);

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // CREATE GOODS RECEIPT
    // =========================================================

    @PostMapping("/goods-receipts")
    public ResponseEntity<PurchaseOrderGoodsReceiptResponse> createGoodsReceipt(
            @Valid @RequestBody PurchaseOrderGoodsReceiptRequest request
    ) {

        PurchaseOrderGoodsReceiptResponse response =
                purchaseOrderService.createGoodsReceipt(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // GET GOODS RECEIPT BY ID
    // =========================================================

    @GetMapping("/goods-receipts/{receiptId}")
    public ResponseEntity<PurchaseOrderGoodsReceiptResponse> getGoodsReceiptById(
            @PathVariable Long receiptId
    ) {

        return ResponseEntity.ok(
                purchaseOrderService.getGoodsReceiptById(receiptId)
        );
    }

    // =========================================================
    // GET GOODS RECEIPTS BY PURCHASE ORDER ID
    // =========================================================

    @GetMapping("/{purchaseOrderId}/goods-receipts")
    public ResponseEntity<List<PurchaseOrderGoodsReceiptResponse>> getGoodsReceiptsByPurchaseOrderId(
            @PathVariable Long purchaseOrderId
    ) {

        return ResponseEntity.ok(
                purchaseOrderService.getGoodsReceiptsByPurchaseOrderId(
                        purchaseOrderId
                )
        );
    }
}