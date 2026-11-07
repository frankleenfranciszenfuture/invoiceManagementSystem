package com.ims.repository.dashbaord;



import com.ims.entity.PurchaseOrderEntity;

import com.ims.service.serviceInterface.dashboard.DashboardMonthlyTrendProjection;
import com.ims.service.serviceInterface.dashboard.DashboardStatusAmountProjection;
import com.ims.service.serviceInterface.dashboard.DashboardStatusCountProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface DashboardPurchaseOrderRepository
        extends JpaRepository<PurchaseOrderEntity, Long> {

    @Query("""
        SELECT COUNT(po)
        FROM PurchaseOrderEntity po
        WHERE po.active = true
          AND po.orderDate BETWEEN :fromDate AND :toDate
    """)
    Long countPurchaseOrders(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    // Purchase value in INR
    @Query("""
        SELECT COALESCE(SUM(po.baseGrandTotal), 0)
        FROM PurchaseOrderEntity po
        WHERE po.active = true
          AND po.orderDate BETWEEN :fromDate AND :toDate
    """)
    BigDecimal getTotalPurchasesInr(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    @Query("""
        SELECT
            po.purchaseOrderStatus AS status,
            COUNT(po) AS count
        FROM PurchaseOrderEntity po
        WHERE po.active = true
          AND po.orderDate BETWEEN :fromDate AND :toDate
        GROUP BY po.purchaseOrderStatus
    """)
    List<DashboardStatusCountProjection> getPurchaseOrderStatusSummary(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    @Query("""
        SELECT
            po.purchaseOrderStatus AS status,
            COUNT(po) AS count,
            COALESCE(SUM(po.baseGrandTotal), 0) AS amount
        FROM PurchaseOrderEntity po
        WHERE po.active = true
          AND po.orderDate BETWEEN :fromDate AND :toDate
        GROUP BY po.purchaseOrderStatus
    """)
    List<DashboardStatusAmountProjection> getPurchaseOrderAmountSummary(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );


    @Query("""
    SELECT
        YEAR(po.orderDate) AS year,
        MONTH(po.orderDate) AS month,
        COALESCE(SUM(po.baseGrandTotal), 0) AS amount
    FROM PurchaseOrderEntity po
    WHERE po.active = true
      AND po.orderDate BETWEEN :fromDate AND :toDate
    GROUP BY YEAR(po.orderDate), MONTH(po.orderDate)
    ORDER BY YEAR(po.orderDate), MONTH(po.orderDate)
""")
    List<DashboardMonthlyTrendProjection> getMonthlyPurchaseTrend(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

}

