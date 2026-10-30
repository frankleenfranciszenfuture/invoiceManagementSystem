package com.ims.utils.specification;


import com.ims.entity.InventoryStockEntity;

import org.springframework.data.jpa.domain.Specification;

public final class InventoryStockSpecification {

    private InventoryStockSpecification() {
    }

    public static Specification<InventoryStockEntity> hasProductId(
            Long productId
    ) {
        return (root, query, cb) ->
                productId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("product").get("id"), productId);
    }

    public static Specification<InventoryStockEntity> hasWarehouseId(
            Long warehouseId
    ) {
        return (root, query, cb) ->
                warehouseId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("warehouse").get("id"), warehouseId);
    }

    public static Specification<InventoryStockEntity> hasUnitId(
            Long unitId
    ) {
        return (root, query, cb) ->
                unitId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("unit").get("id"), unitId);
    }

    public static Specification<InventoryStockEntity> hasSizeId(
            Long sizeId
    ) {
        return (root, query, cb) ->
                sizeId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("size").get("id"), sizeId);
    }

    public static Specification<InventoryStockEntity> availableOnly(
            Boolean availableOnly
    ) {
        return (root, query, cb) ->
                Boolean.TRUE.equals(availableOnly)
                        ? cb.greaterThan(
                        root.get("availableQuantity"),
                        java.math.BigDecimal.ZERO
                )
                        : cb.conjunction();
    }

    public static Specification<InventoryStockEntity> lowStock(
            java.math.BigDecimal minimumQuantity
    ) {
        return (root, query, cb) ->
                minimumQuantity == null
                        ? cb.conjunction()
                        : cb.lessThanOrEqualTo(
                        root.get("availableQuantity"),
                        minimumQuantity
                );
    }
}
