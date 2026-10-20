package com.ims.repository;

import com.ims.entity.CreditClearanceEntity;
import com.ims.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CreditClearanceRepository
        extends JpaRepository<CreditClearanceEntity, Long> {

    // =====================================================
    // FIND BY CLEARANCE NUMBER
    // =====================================================

    Optional<CreditClearanceEntity> findByClearanceNo(
            String clearanceNo
    );

    // =====================================================
    // FIND BY PARTY
    // =====================================================

    List<CreditClearanceEntity>
    findByPartyIdAndStatusOrderByClearanceDateDesc(
            Long partyId,
            Status status
    );

    // =====================================================
    // FIND BY PARTY - PAGED
    // =====================================================

    Page<CreditClearanceEntity> findByPartyIdAndStatus(
            Long partyId,
            Status status,
            Pageable pageable
    );

    // =====================================================
    // FIND ALL ACTIVE - PAGED
    // =====================================================

    Page<CreditClearanceEntity> findByStatus(
            Status status,
            Pageable pageable
    );

    // =====================================================
    // FIND BY DATE RANGE - ALL RECORDS
    // =====================================================

    List<CreditClearanceEntity>
    findByStatusAndClearanceDateBetween(
            Status status,
            LocalDate fromDate,
            LocalDate toDate
    );

    // =====================================================
    // GENERATE CLEARANCE NUMBER
    // =====================================================

    Optional<CreditClearanceEntity>
    findTopByClearanceNoStartingWithOrderByIdDesc(
            String clearanceNoPrefix
    );

    // =====================================================
    // CHECK DUPLICATE CLEARANCE NUMBER
    // =====================================================

    boolean existsByClearanceNo(
            String clearanceNo
    );

    // =====================================================
    // CHECK PARTY CLEARANCE
    // =====================================================

    boolean existsByPartyIdAndStatus(
            Long partyId,
            Status status
    );

    // =====================================================
    // FIND BY ID AND STATUS
    // =====================================================

    Optional<CreditClearanceEntity> findByIdAndStatus(
            Long id,
            Status status
    );
}