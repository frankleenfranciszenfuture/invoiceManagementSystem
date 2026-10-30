package com.ims.utils.specification;


import com.ims.entity.InventoryTransactionEntity;
import com.ims.enums.InventoryMovementType;
import com.ims.enums.InventoryReferenceType;

import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public final class InventoryTransactionSpecification {

    private InventoryTransactionSpecification() {
    }

    public static Specification<InventoryTransactionEntity> hasProductId(
            Long productId
    ) {
        return (root, query, cb) ->
                productId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("product").get("id"), productId);
    }

    public static Specification<InventoryTransactionEntity> hasWarehouseId(
            Long warehouseId
    ) {
        return (root, query, cb) ->
                warehouseId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("warehouse").get("id"), warehouseId);
    }

    public static Specification<InventoryTransactionEntity> hasUnitId(
            Long unitId
    ) {
        return (root, query, cb) ->
                unitId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("unit").get("id"), unitId);
    }

    public static Specification<InventoryTransactionEntity> hasSizeId(
            Long sizeId
    ) {
        return (root, query, cb) ->
                sizeId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("size").get("id"), sizeId);
    }

    public static Specification<InventoryTransactionEntity> hasMovementType(
            InventoryMovementType movementType
    ) {
        return (root, query, cb) ->
                movementType == null
                        ? cb.conjunction()
                        : cb.equal(root.get("movementType"), movementType);
    }

    public static Specification<InventoryTransactionEntity> hasReferenceType(
            InventoryReferenceType referenceType
    ) {
        return (root, query, cb) ->
                referenceType == null
                        ? cb.conjunction()
                        : cb.equal(root.get("referenceType"), referenceType);
    }

    public static Specification<InventoryTransactionEntity> hasReferenceId(
            Long referenceId
    ) {
        return (root, query, cb) ->
                referenceId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("referenceId"), referenceId);
    }

    public static Specification<InventoryTransactionEntity> fromDate(
            LocalDateTime fromDate
    ) {
        return (root, query, cb) ->
                fromDate == null
                        ? cb.conjunction()
                        : cb.greaterThanOrEqualTo(
                        root.get("transactionDate"),
                        fromDate
                );
    }

    public static Specification<InventoryTransactionEntity> toDate(
            LocalDateTime toDate
    ) {
        return (root, query, cb) ->
                toDate == null
                        ? cb.conjunction()
                        : cb.lessThanOrEqualTo(
                        root.get("transactionDate"),
                        toDate
                );
    }
}