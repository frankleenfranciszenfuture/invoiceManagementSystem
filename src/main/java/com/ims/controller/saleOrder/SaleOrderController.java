
package com.ims.controller.saleOrder;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;

import com.ims.dtos.saleOrder.SalesOrderRequest;
import com.ims.dtos.saleOrder.SalesOrderResponse;
import com.ims.dtos.saleOrder.SalesOrderSearchRequest;

import com.ims.service.serviceInterface.saleOrder.SaleOrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sale-orders")
@RequiredArgsConstructor
public class SaleOrderController {

    private final SaleOrderService saleOrderService;

    // =====================================================
    // CREATE SALE ORDER
    // =====================================================

    @PostMapping
    public ResponseEntity<ApiResponse<SalesOrderResponse>> create(
            @Valid @RequestBody SalesOrderRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saleOrderService.createSalesOrder(request));
    }

    // =====================================================
    // GET SALE ORDER BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesOrderResponse>> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                saleOrderService.getSalesOrderById(id)
        );
    }

    // =====================================================
    // GET ALL SALE ORDERS
    // FILTER + PAGINATION
    // =====================================================

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SalesOrderResponse>>> getAll(

            @ModelAttribute SalesOrderSearchRequest request,

            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable

    ) {

        return ResponseEntity.ok(
                saleOrderService.getAllSalesOrders(request, pageable)
        );
    }

    // =====================================================
    // UPDATE SALE ORDER
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesOrderResponse>> update(

            @PathVariable Long id,

            @Valid @RequestBody SalesOrderRequest request

    ) {

        return ResponseEntity.ok(
                saleOrderService.updateSalesOrder(id, request)
        );
    }

    @PatchMapping("/{id}/dispatch")
    public ResponseEntity<ApiResponse<SalesOrderResponse>> dispatchSalesOrder(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                saleOrderService.dispatchSalesOrder(id)
        );
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<SalesOrderResponse>> confirmSalesOrder(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                saleOrderService.confirmSalesOrder(id)
        );
    }

    // =====================================================
    // CANCEL SALE ORDER
    // =====================================================

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<SalesOrderResponse>> cancel(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                saleOrderService.cancelSalesOrder(id)
        );
    }

    // =====================================================
    // DELETE SALE ORDER (SOFT DELETE)
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                saleOrderService.deleteSalesOrder(id)
        );
    }


}
