package com.ims.repository;


import com.ims.entity.InventoryTransactionEntity;
import com.ims.enums.InventoryMovementType;
import com.ims.enums.InventoryReferenceType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryTransactionRepository
        extends JpaRepository<InventoryTransactionEntity, Long>,
        JpaSpecificationExecutor<InventoryTransactionEntity> {

    // Find transaction by transaction number
    Optional<InventoryTransactionEntity> findByTransactionNo(
            String transactionNo
    );

    // Find transactions by product
    Page<InventoryTransactionEntity> findByProduct_Id(
            Long productId,
            Pageable pageable
    );

    // Find transactions by warehouse
    Page<InventoryTransactionEntity> findByWarehouse_Id(
            Long warehouseId,
            Pageable pageable
    );

    // Find transactions by product and warehouse
    Page<InventoryTransactionEntity>
    findByProduct_IdAndWarehouse_Id(
            Long productId,
            Long warehouseId,
            Pageable pageable
    );

    // Find transactions by movement type
    Page<InventoryTransactionEntity> findByMovementType(
            InventoryMovementType movementType,
            Pageable pageable
    );

    // Find transactions by reference
    List<InventoryTransactionEntity>
    findAllByReferenceTypeAndReferenceId(
            InventoryReferenceType referenceType,
            Long referenceId
    );

    // Prevent duplicate posting of source documents
    boolean existsByReferenceTypeAndReferenceId(
            InventoryReferenceType referenceType,
            Long referenceId
    );

    // Find transactions within a date range
    Page<InventoryTransactionEntity>
    findByTransactionDateBetween(
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    // Find transactions by product, warehouse and date range
    Page<InventoryTransactionEntity>
    findByProduct_IdAndWarehouse_IdAndTransactionDateBetween(
            Long productId,
            Long warehouseId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    // Find latest transactions
    List<InventoryTransactionEntity>
    findTop10ByProduct_IdOrderByTransactionDateDesc(
            Long productId
    );

    // Find transaction by ID
    Optional<InventoryTransactionEntity> findById(
            Long id
    );

    // Find transactions by reference type and ID with pagination
    Page<InventoryTransactionEntity>
    findByReferenceTypeAndReferenceId(
            InventoryReferenceType referenceType,
            Long referenceId,
            Pageable pageable
    );

    boolean existsByReferenceTypeAndReferenceIdAndMovementType(
            InventoryReferenceType referenceType,
            Long referenceId,
            InventoryMovementType movementType
    );
}
