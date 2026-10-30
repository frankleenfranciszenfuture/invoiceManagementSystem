package com.ims.repository;

import com.ims.entity.WarehouseEntity;
import com.ims.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends
        JpaRepository<WarehouseEntity, Long>,
        JpaSpecificationExecutor<WarehouseEntity> {

    // =====================================================
    // FIND ALL
    // =====================================================

    @Override
    List<WarehouseEntity> findAll();

    @Override
    Optional<WarehouseEntity> findById(Long id);

    // =====================================================
    // ACTIVE WAREHOUSE
    // =====================================================

    Page<WarehouseEntity> findAllByActiveTrue(Pageable pageable);

    Optional<WarehouseEntity> findByIdAndActiveTrue(Long id);

    List<WarehouseEntity> findAllByActiveTrueOrderByWarehouseNameAsc();

    // =====================================================
    // GENERATE WAREHOUSE CODE
    // =====================================================

    Optional<WarehouseEntity> findTopByOrderByIdDesc();

    // =====================================================
    // DUPLICATE VALIDATION
    // =====================================================

    boolean existsByWarehouseNameIgnoreCase(String warehouseName);

    boolean existsByWarehouseNameIgnoreCaseAndIdNot(
            String warehouseName,
            Long id
    );

    // =====================================================
    // WAREHOUSE LIST
    // =====================================================

    List<WarehouseEntity> findAllByOrderByWarehouseNameAsc();

    // =====================================================
    // STATUS
    // =====================================================

    List<WarehouseEntity> findAllByStatus(Status status);

    Long countByActiveTrue();

    // =====================================================
    // AUDIT
    // =====================================================

    @Query("""
        SELECT w
        FROM WarehouseEntity w
        WHERE w.id = :id
        """)
    Optional<WarehouseEntity> findByIdForAudit(
            @Param("id") Long id
    );
}
