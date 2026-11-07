package com.ims.repository.dashbaord;


import com.ims.entity.InvoiceEntity;
import com.ims.enums.InvoiceStatus;
import com.ims.enums.PaymentStatus;
import com.ims.enums.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface DashboardInvoiceRepository
        extends JpaRepository<InvoiceEntity, Long> {

    // =====================================================
    // TOTAL OUTSTANDING INVOICES (INR)
    // =====================================================

    @Query("""
        SELECT COALESCE(
            SUM(
                (i.grandTotal * i.exchangeRate)
                -
                COALESCE(
                    (
                        SELECT SUM(p.baseAmount)
                        FROM PaymentEntity p
                        WHERE p.paymentType = :paymentType
                          AND p.sourceId = i.id
                          AND p.paymentStatus = :completedStatus
                          AND p.active = true
                    ),
                    0
                )
            ),
            0
        )
        FROM InvoiceEntity i
        WHERE i.active = true
          AND i.status NOT IN :excludedStatuses
        """)
    BigDecimal getTotalOutstandingInvoiceReceivablesInr(
            @Param("paymentType") PaymentType paymentType,
            @Param("completedStatus") PaymentStatus completedStatus,
            @Param("excludedStatuses") java.util.Collection<InvoiceStatus> excludedStatuses
    );

    // =====================================================
    // OVERDUE INVOICES (INR)
    // =====================================================

    @Query("""
        SELECT COALESCE(
            SUM(
                (i.grandTotal * i.exchangeRate)
                -
                COALESCE(
                    (
                        SELECT SUM(p.baseAmount)
                        FROM PaymentEntity p
                        WHERE p.paymentType = :paymentType
                          AND p.sourceId = i.id
                          AND p.paymentStatus = :completedStatus
                          AND p.active = true
                    ),
                    0
                )
            ),
            0
        )
        FROM InvoiceEntity i
        WHERE i.active = true
          AND i.dueDate IS NOT NULL
          AND i.dueDate < :today
          AND i.status NOT IN :excludedStatuses
          AND (
              (i.grandTotal * i.exchangeRate)
              -
              COALESCE(
                  (
                      SELECT SUM(p.baseAmount)
                      FROM PaymentEntity p
                      WHERE p.paymentType = :paymentType
                        AND p.sourceId = i.id
                        AND p.paymentStatus = :completedStatus
                        AND p.active = true
                  ),
                  0
              )
          ) > 0
        """)
    BigDecimal getOverdueInvoiceReceivablesInr(
            @Param("today") LocalDate today,
            @Param("paymentType") PaymentType paymentType,
            @Param("completedStatus") PaymentStatus completedStatus,
            @Param("excludedStatuses") java.util.Collection<InvoiceStatus> excludedStatuses
    );
}
