package com.ims.repository;

import com.ims.entity.PaymentEntity;
import com.ims.enums.PaymentStatus;
import com.ims.enums.PaymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends
        JpaRepository<PaymentEntity, Long>,
        JpaSpecificationExecutor<PaymentEntity> {

    Optional<PaymentEntity> findByIdAndActiveTrue(Long id);

    Optional<PaymentEntity> findByPaymentNumberIgnoreCase(String paymentNumber);

    boolean existsByPaymentNumberIgnoreCase(String paymentNumber);

    boolean existsByPaymentNumberIgnoreCaseAndIdNot(
            String paymentNumber,
            Long id
    );

    Page<PaymentEntity> findAllByActiveTrue(Pageable pageable);

    Page<PaymentEntity> findAllByPaymentTypeAndActiveTrue(
            PaymentType paymentType,
            Pageable pageable
    );

    Page<PaymentEntity> findAllByPaymentStatusAndActiveTrue(
            PaymentStatus paymentStatus,
            Pageable pageable
    );

    List<PaymentEntity> findAllByPaymentTypeAndSourceIdAndActiveTrue(
            PaymentType paymentType,
            Long sourceId
    );

    @Query("""
        SELECT COALESCE(SUM(p.paymentAmount), 0)
        FROM PaymentEntity p
        WHERE p.paymentType = :paymentType
          AND p.sourceId = :sourceId
          AND p.paymentStatus = :paymentStatus
          AND p.active = true
        """)
    BigDecimal calculateCompletedPaymentAmount(
            @Param("paymentType") PaymentType paymentType,
            @Param("sourceId") Long sourceId,
            @Param("paymentStatus") PaymentStatus paymentStatus
    );

    @Query("""
        SELECT COUNT(p)
        FROM PaymentEntity p
        WHERE p.paymentType = :paymentType
          AND p.sourceId = :sourceId
          AND p.paymentStatus = :paymentStatus
          AND p.active = true
        """)
    long countBySourceAndStatus(
            @Param("paymentType") PaymentType paymentType,
            @Param("sourceId") Long sourceId,
            @Param("paymentStatus") PaymentStatus paymentStatus
    );

    boolean existsByIdAndPaymentStatus(
            Long id,
            PaymentStatus paymentStatus
    );
}