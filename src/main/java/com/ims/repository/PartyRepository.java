package com.ims.repository;

import com.ims.entity.PartyEntity;
import com.ims.enums.PartyType;
import com.ims.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PartyRepository extends
        JpaRepository<PartyEntity, Long>,
        JpaSpecificationExecutor<PartyEntity> {

    // =====================================================
    // FIND PARTY
    // =====================================================

    Optional<PartyEntity> findByIdAndActiveTrue(Long id);


    // =====================================================
    // FIND ALL ACTIVE
    // =====================================================

    Page<PartyEntity> findAllByActiveTrue(Pageable pageable);


    // =====================================================
    // DUPLICATE VALIDATION - CREATE
    // ACTIVE ONLY
    // =====================================================

    boolean existsByEmailAndActiveTrue(String email);

    boolean existsByMobileAndActiveTrue(String mobile);

    boolean existsByGstNumberAndActiveTrue(String gstNumber);

    boolean existsByPanNumberAndActiveTrue(String panNumber);


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

    boolean existsByGstNumberAndActiveTrueAndIdNot(
            String gstNumber,
            Long id
    );

    boolean existsByPanNumberAndActiveTrueAndIdNot(
            String panNumber,
            Long id
    );


    // =====================================================
    // FIND EXISTING RECORDS
    // INCLUDING SOFT-DELETED RECORDS
    // =====================================================

    Optional<PartyEntity> findByEmailIgnoreCase(String email);

    Optional<PartyEntity> findByMobile(String mobile);

    Optional<PartyEntity> findByGstNumber(String gstNumber);

    Optional<PartyEntity> findByPanNumber(String panNumber);


    // =====================================================
    // PARTY TYPE
    // =====================================================

    List<PartyEntity> findAllByPartyTypeAndActiveTrue(
            PartyType partyType
    );


    // =====================================================
    // STATUS
    // =====================================================

    List<PartyEntity> findAllByStatusAndActiveTrue(
            Status status
    );


    // =====================================================
    // SEARCH
    // =====================================================

    List<PartyEntity>
    findAllByCompanyNameContainingIgnoreCaseAndActiveTrue(
            String companyName
    );


    // =====================================================
    // PARTY CODE GENERATION
    // =====================================================

    Optional<PartyEntity>
    findTopByPartyCodeStartingWithOrderByIdDesc(
            String prefix
    );


    // =====================================================
    // OTHER FIND METHODS
    // =====================================================

    Page<PartyEntity> findAll(
            Pageable pageable
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
        SELECT p
        FROM PartyEntity p
        WHERE p.id = :id
    """)
    Optional<PartyEntity> findByIdForAudit(
            @Param("id") Long id
    );
}