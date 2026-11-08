package com.ims.repository;

import com.ims.entity.BankAccount;
import com.ims.enums.BankAccountStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BankAccountRepository
        extends JpaRepository<BankAccount, Long>,
        JpaSpecificationExecutor<BankAccount> {

    // =====================================================
    // CREATE
    // NON-DELETED ACCOUNTS ONLY
    // =====================================================

    boolean existsByAccountCodeIgnoreCaseAndStatusNot(
            String accountCode,
            BankAccountStatus status
    );

    boolean existsByAccountNumberAndStatusNot(
            String accountNumber,
            BankAccountStatus status
    );

    // =====================================================
    // UPDATE
    // EXCLUDE DELETED ACCOUNTS
    // EXCLUDE CURRENT ACCOUNT
    // =====================================================

    boolean existsByAccountCodeIgnoreCaseAndStatusNotAndIdNot(
            String accountCode,
            BankAccountStatus status,
            Long id
    );

    boolean existsByAccountNumberAndStatusNotAndIdNot(
            String accountNumber,
            BankAccountStatus status,
            Long id
    );

    // =====================================================
    // PRIMARY ACCOUNT
    // NON-DELETED ACCOUNTS ONLY
    // =====================================================

    boolean existsByPrimaryAccountTrueAndStatusNot(
            BankAccountStatus status
    );

    boolean existsByPrimaryAccountTrueAndStatusNotAndIdNot(
            BankAccountStatus status,
            Long id
    );

    // =====================================================
    // GET ALL
    // EXCLUDE DELETED ACCOUNTS
    // =====================================================

    Page<BankAccount> findByStatusNot(
            BankAccountStatus status,
            Pageable pageable
    );

    Optional<BankAccount> findByIdAndStatusNot(
            Long id,
            BankAccountStatus status
    );
}