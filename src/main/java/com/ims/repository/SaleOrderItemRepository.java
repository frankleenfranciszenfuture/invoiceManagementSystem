
package com.ims.repository;

import com.ims.entity.SalesOrderItemEntity;
import com.ims.enums.SaleOrderStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface SaleOrderItemRepository
        extends JpaRepository<SalesOrderItemEntity, Long> {

    // --------------------------------------------------
    // CONFIRMED SALES QUANTITY
    // --------------------------------------------------

    @Query("""
        SELECT COALESCE(SUM(i.quantity), 0)
        FROM SalesOrderItemEntity i
        JOIN i.salesOrder s
        WHERE i.product.id = :productId
          AND i.active = true
          AND s.active = true
          AND s.salesOrderStatus = :status
    """)
    BigDecimal calculateConfirmedSalesQuantity(
            @Param("productId") Long productId,
            @Param("status") SaleOrderStatus status
    );

    // --------------------------------------------------
    // ITEMS BY SALES ORDER
    // --------------------------------------------------

    List<SalesOrderItemEntity> findAllBySalesOrder_IdAndActiveTrue(
            Long salesOrderId
    );

    // --------------------------------------------------
    // ITEMS BY PRODUCT
    // --------------------------------------------------

    List<SalesOrderItemEntity> findAllByProduct_IdAndActiveTrue(
            Long productId
    );

    // --------------------------------------------------
    // DELETE / REPLACEMENT SUPPORT
    // --------------------------------------------------

    List<SalesOrderItemEntity> findAllBySalesOrder_Id(
            Long salesOrderId
    );

    // --------------------------------------------------
    // PRODUCT QUANTITY BY SALES ORDER
    // --------------------------------------------------

    @Query("""
        SELECT COALESCE(SUM(i.quantity), 0)
        FROM SalesOrderItemEntity i
        JOIN i.salesOrder s
        WHERE i.product.id = :productId
          AND s.id = :saleOrderId
          AND i.active = true
          AND s.active = true
    """)
    BigDecimal calculateProductQuantityInSaleOrder(
            @Param("productId") Long productId,
            @Param("saleOrderId") Long saleOrderId
    );
}
