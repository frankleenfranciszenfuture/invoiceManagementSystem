
package com.ims.repository.dashbaord;

import com.ims.entity.PaymentEntity;

import com.ims.enums.PaymentStatus;
import com.ims.enums.PaymentType;
import com.ims.service.serviceInterface.dashboard.DashboardPaymentProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;

public interface DashboardPaymentRepository
        extends JpaRepository<PaymentEntity, Long> {

    @Query("""
        SELECT
            p.paymentDirection AS direction,
            p.paymentStatus AS status,

            CASE
                WHEN p.cashAccount IS NOT NULL THEN 'CASH'
                WHEN p.bankAccount IS NOT NULL THEN 'BANK'
                ELSE 'OTHER'
            END AS channel,

            COUNT(p) AS count,

            COALESCE(SUM(p.baseAmount), 0) AS amount

        FROM PaymentEntity p

        WHERE p.active = true
          AND p.paymentDate BETWEEN :fromDate AND :toDate

        GROUP BY
            p.paymentDirection,
            p.paymentStatus,
            CASE
                WHEN p.cashAccount IS NOT NULL THEN 'CASH'
                WHEN p.bankAccount IS NOT NULL THEN 'BANK'
                ELSE 'OTHER'
            END

        """)
    List<DashboardPaymentProjection> getPaymentSummary(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    @Query("""
        SELECT COALESCE(SUM(p.baseAmount), 0)
        FROM PaymentEntity p
        WHERE p.active = true
          AND p.paymentDate BETWEEN :fromDate AND :toDate
        """)
    BigDecimal getTotalPaymentsInr(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    @Query("""
        SELECT COUNT(p)
        FROM PaymentEntity p
        WHERE p.active = true
          AND p.paymentDate BETWEEN :fromDate AND :toDate
        """)
    Long countPayments(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    // =========================================================
// COMPLETED PAYMENT AMOUNT BY SOURCE
// =========================================================

    @Query("""
    SELECT COALESCE(SUM(p.paymentAmount), 0)
    FROM PaymentEntity p
    WHERE p.active = true
      AND p.paymentType = :paymentType
      AND p.sourceId = :sourceId
      AND p.paymentStatus = :paymentStatus
    """)
    BigDecimal calculateCompletedPaymentAmount(
            @Param("paymentType") PaymentType paymentType,
            @Param("sourceId") Long sourceId,
            @Param("paymentStatus") PaymentStatus paymentStatus
    );
}
