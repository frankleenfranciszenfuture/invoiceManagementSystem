package com.ims.service.serviceInterface.inventory;

import com.ims.dtos.inventory.*;

import com.ims.entity.SalesOrderEntity;
import com.ims.enums.InventoryMovementType;
import com.ims.enums.InventoryReferenceType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface InventoryService {

    // =====================================================
    // OPENING STOCK
    // =====================================================

    InventoryStockResponse createOpeningStock(
            InventoryOpeningStockRequest request
    );

    // =====================================================
    // STOCK ADJUSTMENT
    // =====================================================

    InventoryStockResponse adjustStock(
            InventoryAdjustmentRequest request
    );

    // =====================================================
    // STOCK DETAILS
    // =====================================================

    InventoryStockResponse getStockById(
            Long stockId
    );

    // =====================================================
    // PAGINATED STOCK LIST
    // =====================================================

    Page<InventoryStockResponse> getAllStocks(
            Long productId,
            Long warehouseId,
            Long unitId,
            Long sizeId,
            Boolean availableOnly,
            Pageable pageable
    );

    // =====================================================
    // PRODUCT STOCK ACROSS WAREHOUSES
    // =====================================================

    Page<InventoryStockResponse> getStockByProduct(
            Long productId,
            Pageable pageable
    );

    // =====================================================
    // WAREHOUSE STOCK
    // =====================================================

    Page<InventoryStockResponse> getStockByWarehouse(
            Long warehouseId,
            Pageable pageable
    );

    // =====================================================
    // LOW STOCK
    // =====================================================

    Page<InventoryStockResponse> getLowStock(
            java.math.BigDecimal minimumQuantity,
            Pageable pageable
    );

    // =====================================================
    // TRANSACTION HISTORY
    // =====================================================

    Page<InventoryTransactionResponse> getAllTransactions(
            Long productId,
            Long warehouseId,
            Long unitId,
            Long sizeId,
            InventoryMovementType movementType,
            InventoryReferenceType referenceType,
            Long referenceId,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable
    );

    // =====================================================
    // TRANSACTION DETAILS
    // =====================================================

    InventoryTransactionResponse getTransactionById(
            Long transactionId
    );

    // =====================================================
    // PRODUCT TRANSACTION HISTORY
    // =====================================================

    Page<InventoryTransactionResponse> getTransactionsByProduct(
            Long productId,
            Pageable pageable
    );

    // =====================================================
    // WAREHOUSE TRANSACTION HISTORY
    // =====================================================

    Page<InventoryTransactionResponse> getTransactionsByWarehouse(
            Long warehouseId,
            Pageable pageable
    );


    // =====================================================
// SALES ORDER STOCK VALIDATION
// =====================================================

    void validateSalesOrderStock(SalesOrderEntity salesOrder);

// =====================================================
// SALES ORDER DISPATCH
// =====================================================

    void dispatchSalesOrder(SalesOrderEntity salesOrder);

    // =====================================================
// INVENTORY DASHBOARD
// =====================================================

    InventoryDashboardResponse getInventoryDashboard(
            InventoryDashboardFilter filter
    );
}
