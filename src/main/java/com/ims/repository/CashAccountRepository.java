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

    boolean existsByAccountCodeIgnoreCaseAndActiveTrue(String accountCode);

    boolean existsByAccountCodeIgnoreCaseAndActiveTrueAndIdNot(
            String accountCode,
            Long id
    );

    Optional<CashAccountEntity> findByIdAndActiveTrue(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT c
        FROM CashAccountEntity c
        WHERE c.id = :id
        AND c.active = true
    """)
    Optional<CashAccountEntity> findActiveByIdForUpdate(
            @Param("id") Long id
    );
}