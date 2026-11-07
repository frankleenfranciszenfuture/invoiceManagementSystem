package com.ims.repository.dashbaord;



import com.ims.entity.SalesOrderEntity;

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
public interface DashboardSalesOrderRepository
        extends JpaRepository<SalesOrderEntity, Long> {

    // Total sales order count within date range
    @Query("""
        SELECT COUNT(so)
        FROM SalesOrderEntity so
        WHERE so.active = true
          AND so.orderDate BETWEEN :fromDate AND :toDate
    """)
    Long countSalesOrders(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    // Total sales value in INR
    @Query("""
        SELECT COALESCE(SUM(so.baseGrandTotal), 0)
        FROM SalesOrderEntity so
        WHERE so.active = true
          AND so.orderDate BETWEEN :fromDate AND :toDate
    """)
    BigDecimal getTotalSalesInr(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    // Sales orders grouped by status
    @Query("""
        SELECT
            so.salesOrderStatus AS status,
            COUNT(so) AS count
        FROM SalesOrderEntity so
        WHERE so.active = true
          AND so.orderDate BETWEEN :fromDate AND :toDate
        GROUP BY so.salesOrderStatus
    """)
    List<DashboardStatusCountProjection> getSalesOrderStatusSummary(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    // Sales amount grouped by status, in INR
    @Query("""
        SELECT
            so.salesOrderStatus AS status,
            COUNT(so) AS count,
            COALESCE(SUM(so.baseGrandTotal), 0) AS amount
        FROM SalesOrderEntity so
        WHERE so.active = true
          AND so.orderDate BETWEEN :fromDate AND :toDate
        GROUP BY so.salesOrderStatus
    """)
    List<DashboardStatusAmountProjection> getSalesOrderAmountSummary(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    @Query("""
    SELECT
        YEAR(so.orderDate) AS year,
        MONTH(so.orderDate) AS month,
        COALESCE(SUM(so.baseGrandTotal), 0) AS amount
    FROM SalesOrderEntity so
    WHERE so.active = true
      AND so.orderDate BETWEEN :fromDate AND :toDate
    GROUP BY YEAR(so.orderDate), MONTH(so.orderDate)
    ORDER BY YEAR(so.orderDate), MONTH(so.orderDate)
""")
    List<DashboardMonthlyTrendProjection> getMonthlySalesTrend(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );
}
