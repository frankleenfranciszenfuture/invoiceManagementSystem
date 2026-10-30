package com.ims.repository;

import com.ims.entity.PaymentEntity;
import com.ims.enums.PaymentReferenceType;
import com.ims.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PaymentRepository extends
        JpaRepository<PaymentEntity, Long>,
        JpaSpecificationExecutor<PaymentEntity> {

    Optional<PaymentEntity> findByIdAndActiveTrue(Long id);

    boolean existsByPaymentNumberIgnoreCase(String paymentNumber);

    boolean existsByPaymentNumberIgnoreCaseAndIdNot(
            String paymentNumber,
            Long id
    );

    long countByStatusAndActiveTrue(PaymentStatus status);

    Page<PaymentEntity> findAllByActiveTrue(Pageable pageable);

    /**
     * Fetch payment details together with party, bank account,
     * and associated bank transaction.
     */
    @Query("""
        SELECT p
        FROM PaymentEntity p
        LEFT JOIN FETCH p.party
        LEFT JOIN FETCH p.bankAccount
        LEFT JOIN FETCH p.bankTransaction
        WHERE p.id = :id
          AND p.active = true
        """)
    Optional<PaymentEntity> findDetailedById(@Param("id") Long id);

    /**
     * Find active payments associated with a specific party.
     */
    Page<PaymentEntity> findAllByParty_IdAndActiveTrue(
            Long partyId,
            Pageable pageable
    );

    /**
     * Find payments associated with a particular order.
     */
    Page<PaymentEntity> findAllByReferenceTypeAndReferenceIdAndActiveTrue(
            PaymentReferenceType referenceType,
            Long referenceId,
            Pageable pageable
    );
}