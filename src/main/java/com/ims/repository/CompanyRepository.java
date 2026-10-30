package com.ims.repository;

import com.ims.entity.CompanyDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository
        extends JpaRepository<CompanyDetails, Long>,
        JpaSpecificationExecutor<CompanyDetails> {

    // =====================================================
    // CREATE - ACTIVE COMPANIES ONLY
    // =====================================================

    boolean existsByCompanyCodeIgnoreCaseAndActiveTrue(
            String companyCode
    );

    boolean existsByGstNumberIgnoreCaseAndActiveTrue(
            String gstNumber
    );

    boolean existsByPanNumberIgnoreCaseAndActiveTrue(
            String panNumber
    );

    boolean existsByPhoneAndActiveTrue(
            String phone
    );


    // =====================================================
    // UPDATE - ACTIVE COMPANIES ONLY
    // EXCLUDE CURRENT COMPANY
    // =====================================================

    boolean existsByCompanyCodeIgnoreCaseAndActiveTrueAndIdNot(
            String companyCode,
            Long id
    );

    boolean existsByGstNumberIgnoreCaseAndActiveTrueAndIdNot(
            String gstNumber,
            Long id
    );

    boolean existsByPanNumberIgnoreCaseAndActiveTrueAndIdNot(
            String panNumber,
            Long id
    );

    boolean existsByPhoneAndActiveTrueAndIdNot(
            String phone,
            Long id
    );

    Optional<CompanyDetails> findByIsDefaultTrue();

    @Modifying(
            flushAutomatically = true,
            clearAutomatically = true
    )
    @Query("""
        UPDATE CompanyDetails c
        SET c.isDefault = false
        WHERE c.isDefault = true
          AND (:excludeId IS NULL OR c.id <> :excludeId)
        """)
    void clearDefaultCompany(
            @Param("excludeId") Long excludeId
    );

    Optional<CompanyDetails> findFirstByActiveTrueAndIsDefaultTrueOrderByIdAsc();
}