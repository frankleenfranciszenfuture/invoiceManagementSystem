
package com.ims.repository;

import com.ims.entity.BankTransactionEntity;
import com.ims.enums.BankTransactionDirection;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface BankTransactionRepository extends
        JpaRepository<BankTransactionEntity, Long>,
        JpaSpecificationExecutor<BankTransactionEntity> {

    Optional<BankTransactionEntity> findByIdAndActiveTrue(Long id);

    boolean existsByTransactionNumberIgnoreCase(String transactionNumber);

    boolean existsByTransactionNumberIgnoreCaseAndIdNot(
            String transactionNumber,
            Long id
    );

    // Original bank transaction linked to a payment.
    Optional<BankTransactionEntity> findByPayment_Id(Long paymentId);

    Optional<BankTransactionEntity> findByPayment_IdAndActiveTrue(
            Long paymentId
    );

    // Prevent duplicate reversal transactions.
    boolean existsByReversalOf_Id(Long transactionId);

    Optional<BankTransactionEntity> findByReversalOf_IdAndActiveTrue(
            Long transactionId
    );

    // Bank account transaction history.
    Page<BankTransactionEntity> findAllByBankAccount_IdAndActiveTrue(
            Long bankAccountId,
            Pageable pageable
    );

    // Payment transaction history.
    Page<BankTransactionEntity> findAllByPayment_IdAndActiveTrue(
            Long paymentId,
            Pageable pageable
    );

    /**
     * Calculate net transaction movement in bank account currency.
     *
     * CREDIT = positive amount
     * DEBIT  = negative amount
     *
     * Includes reversal transactions.
     */
    @Query("""
            SELECT COALESCE(
                SUM(
                    CASE
                        WHEN t.direction = :creditDirection
                        THEN t.amount
                        ELSE -t.amount
                    END
                ),
                0
            )
            FROM BankTransactionEntity t
            WHERE t.bankAccount.id = :bankAccountId
              AND t.active = true
            """)
    BigDecimal calculateNetMovement(
            @Param("bankAccountId") Long bankAccountId,
            @Param("creditDirection") BankTransactionDirection creditDirection
    );

    /**
     * Count active transactions for a bank account.
     */
    long countByBankAccount_IdAndActiveTrue(Long bankAccountId);

    /**
     * Count active transactions by direction.
     */
    long countByBankAccount_IdAndDirectionAndActiveTrue(
            Long bankAccountId,
            BankTransactionDirection direction
    );
}
