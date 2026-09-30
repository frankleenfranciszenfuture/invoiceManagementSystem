package com.ims.repository;


import com.ims.entity.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface BankAccountRepository
        extends JpaRepository<BankAccount, Long>,
        JpaSpecificationExecutor<BankAccount> {

    // =====================================================
    // CREATE
    // ACTIVE ACCOUNTS ONLY
    // =====================================================

    boolean existsByAccountCodeIgnoreCaseAndActiveTrue(
            String accountCode
    );

    boolean existsByAccountNumberAndActiveTrue(
            String accountNumber
    );


    // =====================================================
    // UPDATE
    // ACTIVE ACCOUNTS ONLY
    // EXCLUDE CURRENT ACCOUNT
    // =====================================================

    boolean existsByAccountCodeIgnoreCaseAndActiveTrueAndIdNot(
            String accountCode,
            Long id
    );

    boolean existsByAccountNumberAndActiveTrueAndIdNot(
            String accountNumber,
            Long id
    );


    // =====================================================
    // PRIMARY ACCOUNT
    // =====================================================

    boolean existsByPrimaryAccountTrueAndActiveTrue();

    boolean existsByPrimaryAccountTrueAndActiveTrueAndIdNot(
            Long id
    );
}