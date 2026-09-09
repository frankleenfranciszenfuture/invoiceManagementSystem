package com.ims.repository;

import com.ims.entity.SizeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SizeRepository extends
        JpaRepository<SizeEntity, Long>,
        JpaSpecificationExecutor<SizeEntity> {

    // =====================================================
    // FIND BY ID
    // =====================================================

    Optional<SizeEntity> findByIdAndActiveTrue(Long id);

    // =====================================================
    // LIST ACTIVE SIZES
    // =====================================================

    List<SizeEntity> findByActiveTrueOrderBySizeNameAsc();

    // =====================================================
    // DUPLICATE NAME - CREATE
    // =====================================================

    boolean existsBySizeNameIgnoreCaseAndActiveTrue(
            String sizeName
    );

    // =====================================================
    // DUPLICATE NAME - UPDATE
    // Exclude current record
    // =====================================================

    boolean existsBySizeNameIgnoreCaseAndIdNotAndActiveTrue(
            String sizeName,
            Long id
    );

    // =====================================================
    // DUPLICATE SHORT NAME - CREATE
    // =====================================================

    boolean existsBySizeShortNameIgnoreCaseAndActiveTrue(
            String sizeShortName
    );

    // =====================================================
    // DUPLICATE SHORT NAME - UPDATE
    // Exclude current record
    // =====================================================

    boolean existsBySizeShortNameIgnoreCaseAndIdNotAndActiveTrue(
            String sizeShortName,
            Long id
    );

    // =====================================================
    // DUPLICATE CODE - CREATE
    // =====================================================

    boolean existsBySizeCodeIgnoreCaseAndActiveTrue(
            String sizeCode
    );

    // =====================================================
    // DUPLICATE CODE - UPDATE
    // Exclude current record
    // =====================================================

    boolean existsBySizeCodeIgnoreCaseAndIdNotAndActiveTrue(
            String sizeCode,
            Long id
    );

    // =====================================================
    // MAX DISPLAY ORDER
    // =====================================================

    @Query("""
        SELECT COALESCE(MAX(s.displayOrder), 0)
        FROM SizeEntity s
        """)
    Integer findMaxDisplayOrder();

    // =====================================================
    // FIND BY ID FOR AUDIT
    // =====================================================

    @Query("""
        SELECT s
        FROM SizeEntity s
        WHERE s.id = :id
        """)
    Optional<SizeEntity> findByIdForAudit(
            @Param("id") Long id
    );
}