package com.ims.repository;


import com.ims.entity.InventoryStockEntity;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryStockRepository
        extends JpaRepository<InventoryStockEntity, Long>,
        JpaSpecificationExecutor<InventoryStockEntity> {

    // Find stock by product, warehouse, unit and size
    Optional<InventoryStockEntity>
    findByProduct_IdAndWarehouse_IdAndUnit_IdAndSize_Id(
            Long productId,
            Long warehouseId,
            Long unitId,
            Long sizeId
    );

    // Find stock without size
    Optional<InventoryStockEntity>
    findByProduct_IdAndWarehouse_IdAndUnit_IdAndSizeIsNull(
            Long productId,
            Long warehouseId,
            Long unitId
    );

    // Find all stock for a product
    Page<InventoryStockEntity> findByProduct_Id(
            Long productId,
            Pageable pageable
    );

    // Find all stock for a warehouse
    Page<InventoryStockEntity> findByWarehouse_Id(
            Long warehouseId,
            Pageable pageable
    );

    // Find stock for a product and warehouse
    Page<InventoryStockEntity> findByProduct_IdAndWarehouse_Id(
            Long productId,
            Long warehouseId,
            Pageable pageable
    );

    // Find all stock for a product
    List<InventoryStockEntity> findAllByProduct_Id(
            Long productId
    );

    // Find all stock for a warehouse
    List<InventoryStockEntity> findAllByWarehouse_Id(
            Long warehouseId
    );

    // Lock stock row during update
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT s
            FROM InventoryStockEntity s
            WHERE s.id = :stockId
            """)
    Optional<InventoryStockEntity> findByIdForUpdate(
            @Param("stockId") Long stockId
    );

    // Lock stock by product, warehouse, unit and size
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT s
        FROM InventoryStockEntity s
        WHERE s.product.id = :productId
          AND s.warehouse.id = :warehouseId
          AND s.unit.id = :unitId
          AND (
                (s.size IS NULL AND :sizeId IS NULL)
                OR
                (s.size IS NOT NULL AND s.size.id = :sizeId)
          )
        """)
    Optional<InventoryStockEntity> findStockForUpdate(
            @Param("productId") Long productId,
            @Param("warehouseId") Long warehouseId,
            @Param("unitId") Long unitId,
            @Param("sizeId") Long sizeId
    );

    // Low stock lookup
    @Query("""
            SELECT s
            FROM InventoryStockEntity s
            WHERE s.availableQuantity <= :minimumQuantity
            """)
    Page<InventoryStockEntity> findLowStock(
            @Param("minimumQuantity") java.math.BigDecimal minimumQuantity,
            Pageable pageable
    );

    boolean existsByProduct_IdAndWarehouse_IdAndUnit_IdAndSize_Id(
            Long productId,
            Long warehouseId,
            Long unitId,
            Long sizeId
    );

    boolean existsByProduct_IdAndWarehouse_IdAndUnit_IdAndSizeIsNull(
            Long productId,
            Long warehouseId,
            Long unitId
    );
}
