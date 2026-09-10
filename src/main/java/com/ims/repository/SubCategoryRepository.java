package com.ims.repository;

import com.ims.entity.CategoryEntity;
import com.ims.entity.SubCategoryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SubCategoryRepository extends
        JpaRepository<SubCategoryEntity, Long>,
        JpaSpecificationExecutor<SubCategoryEntity> {

    // =====================================================
    // BASIC FIND
    // =====================================================

    @Override
    List<SubCategoryEntity> findAll();

    @Override
    Optional<SubCategoryEntity> findById(Long id);


    // =====================================================
    // SUB CATEGORY CODE
    // =====================================================

    boolean existsBySubCategoryCode(
            String subCategoryCode
    );


    // =====================================================
    // SUB CATEGORY CODE - ACTIVE
    // =====================================================

    boolean existsBySubCategoryCodeAndActiveTrue(
            String subCategoryCode
    );

    boolean existsBySubCategoryCodeAndIdNotAndActiveTrue(
            String subCategoryCode,
            Long id
    );


    // =====================================================
    // NAME - CATEGORY
    // =====================================================

    boolean existsByNameIgnoreCaseAndCategory_IdAndActiveTrue(
            String name,
            Long categoryId
    );

    boolean existsByNameIgnoreCaseAndCategory_IdAndActiveTrueAndIdNot(
            String name,
            Long categoryId,
            Long id
    );

    boolean existsByNameIgnoreCaseAndCategory_IdAndIdNotAndActiveTrue(
            String name,
            Long categoryId,
            Long id
    );


    // =====================================================
    // TOP / CODE
    // =====================================================

    Optional<SubCategoryEntity> findTopByOrderByIdDesc();

    Optional<SubCategoryEntity> findBySubCategoryCode(
            String subCategoryCode
    );


    // =====================================================
    // ACTIVE LIST
    // =====================================================

    List<SubCategoryEntity> findByActiveTrueOrderByNameAsc();


    List<SubCategoryEntity>
    findByCategory_IdAndActiveTrueOrderByNameAsc(
            Long categoryId
    );


    // =====================================================
    // CATEGORY DELETE VALIDATION
    // =====================================================

    boolean existsByCategory_IdAndActiveTrue(
            Long categoryId
    );

    boolean existsByCategoryAndActiveTrue(
            CategoryEntity category
    );


    // =====================================================
    // FIND BY ID + CATEGORY
    // =====================================================

    Optional<SubCategoryEntity>
    findByIdAndActiveTrue(
            Long id
    );


    // =====================================================
    // PAGINATION
    // =====================================================

    Page<SubCategoryEntity>
    findByActiveTrueOrderByNameAsc(
            Pageable pageable
    );


    Page<SubCategoryEntity>
    findByCategory_IdAndActiveTrueOrderByNameAsc(
            Long categoryId,
            Pageable pageable
    );


    // =====================================================
    // AUDIT
    // =====================================================

    @Query("""
        SELECT s
        FROM SubCategoryEntity s
        LEFT JOIN FETCH s.category
        WHERE s.id = :id
        """)
    Optional<SubCategoryEntity> findByIdForAudit(
            @Param("id") Long id
    );
}
