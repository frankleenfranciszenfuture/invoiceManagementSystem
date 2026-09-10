package com.ims.repository;

import com.ims.entity.CategoryEntity;
import com.ims.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository
        extends JpaRepository<CategoryEntity, Long> {

    // =====================================================
    // FIND BY ID
    // =====================================================

    Optional<CategoryEntity> findByIdAndActiveTrue(
            Long id
    );


    // =====================================================
    // FIND - ALL ACTIVE
    // =====================================================

    Page<CategoryEntity> findByActiveTrueOrderByCategoryNameAsc(
            Pageable pageable
    );


    List<CategoryEntity> findByActiveTrue();


    List<CategoryEntity> findByActiveTrueOrderByCategoryNameAsc();


    // =====================================================
    // SEARCH
    // =====================================================

    Page<CategoryEntity>
    findByCategoryNameContainingIgnoreCaseAndActiveTrue(
            String keyword,
            Pageable pageable
    );


    // =====================================================
    // STATUS
    // =====================================================

    Page<CategoryEntity> findByStatusAndActiveTrue(
            Status status,
            Pageable pageable
    );


    // =====================================================
    // DUPLICATE VALIDATION - CREATE
    //
    // Only ACTIVE categories are considered duplicates.
    // =====================================================

    boolean existsByCategoryNameIgnoreCaseAndActiveTrue(
            String categoryName
    );


    // =====================================================
    // DUPLICATE VALIDATION - UPDATE
    //
    // Only ACTIVE categories are considered.
    // Current category ID is excluded.
    // =====================================================

    boolean existsByCategoryNameIgnoreCaseAndActiveTrueAndIdNot(
            String categoryName,
            Long id
    );


    // =====================================================
    // CATEGORY CODE
    // =====================================================

    Optional<CategoryEntity> findByCategoryCode(
            String categoryCode
    );


    Optional<CategoryEntity> findTopByOrderByIdDesc();
}