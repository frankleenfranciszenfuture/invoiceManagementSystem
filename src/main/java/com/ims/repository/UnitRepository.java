package com.ims.repository;

import com.ims.entity.UnitEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnitRepository extends
        JpaRepository<UnitEntity, Long>,
        JpaSpecificationExecutor<UnitEntity> {

    // =====================================================
    // FIND BY ID
    // =====================================================

    @Override
    Optional<UnitEntity> findById(Long id);

    // =====================================================
    // DUPLICATE NAME - CREATE
    // Only ACTIVE records
    // =====================================================

    boolean existsByUnitNameIgnoreCaseAndActiveTrue(
            String unitName
    );

    // =====================================================
    // DUPLICATE NAME - UPDATE
    // Exclude current record
    // Only ACTIVE records
    // =====================================================

    boolean existsByUnitNameIgnoreCaseAndIdNotAndActiveTrue(
            String unitName,
            Long id
    );

    // =====================================================
    // DUPLICATE CODE - CREATE
    // Only ACTIVE records
    // =====================================================

    boolean existsByUnitCodeIgnoreCaseAndActiveTrue(
            String unitCode
    );

    // =====================================================
    // DUPLICATE CODE - UPDATE
    // Exclude current record
    // Only ACTIVE records
    // =====================================================

    boolean existsByUnitCodeIgnoreCaseAndIdNotAndActiveTrue(
            String unitCode,
            Long id
    );

    // =====================================================
    // LIST ACTIVE UNITS
    // =====================================================

    List<UnitEntity> findByActiveTrueOrderByUnitNameAsc();

    // =====================================================
    // FIND ACTIVE UNIT BY ID
    // =====================================================

    Optional<UnitEntity> findByIdAndActiveTrue(
            Long id
    );

    // =====================================================
    // FIND UNIT FOR AUDIT
    // =====================================================

    @Query("""
        SELECT u
        FROM UnitEntity u
        WHERE u.id = :id
        """)
    Optional<UnitEntity> findByIdForAudit(
            @Param("id") Long id
    );
}