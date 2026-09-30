package com.ims.repository;

import com.ims.entity.CompanyDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

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
}