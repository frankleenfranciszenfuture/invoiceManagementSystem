
package com.ims.repository.dashbaord;

import com.ims.entity.CustomerEntity;
import com.ims.service.serviceInterface.dashboard.DashboardCustomerGrowthProjection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DashboardCustomerRepository
        extends JpaRepository<CustomerEntity, Long> {

    // ==========================================
    // TOTAL ACTIVE CUSTOMERS
    // ==========================================

    @Query("""
        SELECT COUNT(c)
        FROM CustomerEntity c
        WHERE c.active = true
    """)
    Long countActiveCustomers();


    // ==========================================
    // MONTHLY CUSTOMER GROWTH
    // ==========================================

    @Query("""
    SELECT
        MONTH(c.createdAt) AS month,
        YEAR(c.createdAt) AS year,
        COUNT(c) AS customers
    FROM CustomerEntity c
    WHERE c.active = true
      AND c.createdAt IS NOT NULL
      AND c.createdAt >= :fromDate
      AND c.createdAt <= :toDate
    GROUP BY YEAR(c.createdAt), MONTH(c.createdAt)
    ORDER BY YEAR(c.createdAt), MONTH(c.createdAt)
""")
    List<DashboardCustomerGrowthProjection> getMonthlyCustomerGrowth(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );

}
