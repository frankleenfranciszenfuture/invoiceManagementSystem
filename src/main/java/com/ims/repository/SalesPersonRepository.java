package com.ims.repository;

import com.ims.entity.PartyEntity;
import com.ims.entity.RoleEntity;
import com.ims.entity.SalesPersonEntity;
import com.ims.enums.PartyType;
import com.ims.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Repository
public interface SalesPersonRepository extends JpaRepository<SalesPersonEntity, Long>,
        JpaSpecificationExecutor<SalesPersonEntity> {

    boolean existsByEmail(String email);

    Optional<SalesPersonEntity> findBySalesPersonName(String salesPersonName);

    boolean existsBySalesPersonNameIgnoreCase(String salesPersonName);

    boolean existsBySalesPersonNameIgnoreCaseAndIdNot(String salesPersonName,
                                                      Long id);

    List<RoleEntity> findByIdOrSalesPersonNameIn(
            Long Id,
            List<String> salesPersonName);


    // =====================================================
    // FIND PARTY
    // =====================================================

    Optional<SalesPersonEntity> findByIdAndActiveTrue(Long id);


    // =====================================================
    // FIND ALL ACTIVE
    // =====================================================

    Page<SalesPersonEntity> findAllByActiveTrue(Pageable pageable);


    // =====================================================
    // DUPLICATE VALIDATION - CREATE
    // ACTIVE ONLY
    // =====================================================

    boolean existsByEmailAndActiveTrue(String email);

    boolean existsByMobileAndActiveTrue(String mobile);


    // =====================================================
    // DUPLICATE VALIDATION - UPDATE
    // ACTIVE ONLY
    // CURRENT ID EXCLUDED
    // =====================================================

    boolean existsByEmailAndActiveTrueAndIdNot(
            String email,
            Long id
    );

    boolean existsByMobileAndActiveTrueAndIdNot(
            String mobile,
            Long id
    );

    // =====================================================
    // FIND EXISTING RECORDS
    // INCLUDING SOFT-DELETED RECORDS
    // =====================================================

    Optional<SalesPersonEntity> findByEmailIgnoreCase(String email);

    Optional<SalesPersonEntity> findByMobile(String mobile);


    // =====================================================
    // STATUS
    // =====================================================

    List<SalesPersonEntity> findAllByStatusAndActiveTrue(
            Status status
    );


    // =====================================================
    // PARTY CODE GENERATION
    // =====================================================

    Optional<SalesPersonEntity>
    findTopBySalesPersonCodeStartingWithOrderByIdDesc(
            String prefix
    );


    // =====================================================
    // COUNTS
    // =====================================================

    Long countByActiveTrueAndCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );

    Long countByActiveTrue();

    Long countByStatusAndActiveTrue(
            Status status
    );


    // =====================================================
    // AUDIT
    // =====================================================

    @Query("""
        SELECT s
        FROM SalesPersonEntity s
        WHERE s.id = :id
    """)
    Optional<SalesPersonEntity> findByIdForAudit(
            @Param("id") Long id
    );

}