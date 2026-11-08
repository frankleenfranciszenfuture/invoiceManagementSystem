package com.ims.repository;

import com.ims.entity.CashAccountEntity;
import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CashAccountRepository
        extends JpaRepository<CashAccountEntity, Long>,
        JpaSpecificationExecutor<CashAccountEntity> {

    boolean existsByAccountCodeIgnoreCaseAndStatusNot(
            String accountCode,
            String status
    );

    boolean existsByAccountCodeIgnoreCaseAndStatusNotAndIdNot(
            String accountCode,
            String status,
            Long id
    );

    Optional<CashAccountEntity> findByIdAndStatusNot(
            Long id,
            String status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT c
        FROM CashAccountEntity c
        WHERE c.id = :id
        AND c.status <> :status
    """)
    Optional<CashAccountEntity> findByIdAndStatusNotForUpdate(
            @Param("id") Long id,
            @Param("status") String status
    );

    @Query("""
    SELECT MAX(CAST(SUBSTRING(c.accountCode, 6) AS integer))
    FROM CashAccountEntity c
    WHERE c.accountCode LIKE 'CASH-%'
""")
    Integer findMaxCashAccountSequence();
}