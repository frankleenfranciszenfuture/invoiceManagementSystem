package com.ims.repository;


import com.ims.entity.CashBookTransactionEntity;
import com.ims.enums.BankTransactionDirection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface CashBookTransactionRepository extends
        JpaRepository<CashBookTransactionEntity, Long>,
        JpaSpecificationExecutor<CashBookTransactionEntity> {

    Optional<CashBookTransactionEntity> findByIdAndActiveTrue(Long id);

    Optional<CashBookTransactionEntity> findByPayment_Id(Long paymentId);

    Optional<CashBookTransactionEntity> findByPayment_IdAndActiveTrue(
            Long paymentId
    );

    boolean existsByTransactionNumberIgnoreCase(String transactionNumber);

    boolean existsByReversalOf_Id(Long transactionId);

    Page<CashBookTransactionEntity> findAllByCashAccount_IdAndActiveTrue(
            Long cashAccountId,
            Pageable pageable
    );

    Page<CashBookTransactionEntity> findAllByPayment_IdAndActiveTrue(
            Long paymentId,
            Pageable pageable
    );

    long countByCashAccount_IdAndActiveTrue(Long cashAccountId);

    long countByCashAccount_IdAndDirectionAndActiveTrue(
            Long cashAccountId,
            BankTransactionDirection direction
    );

    @Query("""
        SELECT COALESCE(
            SUM(
                CASE
                    WHEN t.direction = :creditDirection THEN t.baseAmount
                    ELSE -t.baseAmount
                END
            ),
            0
        )
        FROM CashBookTransactionEntity t
        WHERE t.cashAccount.id = :cashAccountId
          AND t.active = true
        """)
    BigDecimal calculateNetMovement(
            @Param("cashAccountId") Long cashAccountId,
            @Param("creditDirection") BankTransactionDirection creditDirection
    );
}