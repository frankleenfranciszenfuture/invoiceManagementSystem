package com.ims.repository;


//
//import com.ims.dtos.dashBoard.ProductStockDTO;
import com.ims.entity.ProductEntity;
import com.ims.entity.SubCategoryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends
        JpaRepository<ProductEntity, Long>,
        JpaSpecificationExecutor<ProductEntity> {


    // =====================================================
    // BASIC FIND
    // =====================================================

    @Override
    @EntityGraph(attributePaths = {
            "subCategory",
            "subCategory.category"
    })
    List<ProductEntity> findAll();


    Optional<ProductEntity> findByIdAndActiveTrue(
            Long productId
    );


    // =====================================================
    // PRODUCT CODE / SKU GENERATION
    // =====================================================

    Optional<ProductEntity> findTopByOrderByIdDesc();


    Optional<ProductEntity> findTopBySubCategoryOrderByIdDesc(
            SubCategoryEntity subCategory
    );


    Optional<ProductEntity> findTopBySubCategory_IdOrderByIdDesc(
            Long subCategoryId
    );


    // =====================================================
    // SKU - ACTIVE
    // =====================================================

    boolean existsBySkuIgnoreCaseAndActiveTrue(
            String sku
    );


    boolean existsBySkuIgnoreCaseAndIdNotAndActiveTrue(
            String sku,
            Long id
    );


    // =====================================================
    // PRODUCT DETAILS FETCH
    // =====================================================

    @EntityGraph(attributePaths = {
            "subCategory",
            "subCategory.category"
    })
    Page<ProductEntity> findAll(
            Specification<ProductEntity> specification,
            Pageable pageable
    );


    // =====================================================
    // SINGLE PRODUCT DETAILS
    // =====================================================

    @EntityGraph(attributePaths = {
            "subCategory",
            "subCategory.category",
            "sizes",
            "units",
            "tax",
            "party"
    })
    @Query("""
            SELECT p
            FROM ProductEntity p
            WHERE p.id = :id
            AND p.active = true
            """)
    Optional<ProductEntity> findProductDetailsById(
            @Param("id") Long id
    );


    // =====================================================
    // PRODUCT NAME - ACTIVE
    // =====================================================

    boolean existsByProductNameIgnoreCaseAndActiveTrue(
            String productName
    );


    Optional<ProductEntity>
    findByProductNameIgnoreCaseAndActiveTrue(
            String productName
    );


    boolean existsByProductNameIgnoreCaseAndIdNotAndActiveTrue(
            String productName,
            Long id
    );


    // =====================================================
    // PRODUCT CODE - ACTIVE
    // Global uniqueness
    // =====================================================

    boolean existsByProductCodeIgnoreCaseAndActiveTrue(
            String productCode
    );


    boolean existsByProductCodeIgnoreCaseAndIdNotAndActiveTrue(
            String productCode,
            Long id
    );


    // =====================================================
    // FIND BY ID
    // =====================================================

    Optional<ProductEntity> findById(
            Long id
    );


    Optional<ProductEntity> findByIdAndActiveFalse(
            Long id
    );


    // =====================================================
    // PRODUCT STOCK
    // =====================================================

//    @Query("""
//            SELECT new com.ntm.dtos.dashBoard.ProductStockDTO(
//                p.id,
//                p.productName,
//                p.minimumStock,
//                p.maximumStock,
//                p.productCode
//            )
//            FROM ProductEntity p
//            WHERE p.active = true
//            """)
//    List<ProductStockDTO> getProductStocks();


    // =====================================================
    // AUDIT
    // =====================================================

    @EntityGraph(attributePaths = {
            "subCategory",
            "subCategory.category",
            "tax",
            "party",
            "sizes",
            "units"
    })
    @Query("""
            SELECT p
            FROM ProductEntity p
            WHERE p.id = :id
            """)
    Optional<ProductEntity> findByIdForAudit(
            @Param("id") Long id
    );
}

