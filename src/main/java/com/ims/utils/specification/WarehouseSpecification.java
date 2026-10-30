
package com.ims.utils.specification;

import com.ims.entity.WarehouseEntity;
import com.ims.enums.Status;
import org.springframework.data.jpa.domain.Specification;

public class WarehouseSpecification {

    // =====================================================
    // SEARCH KEYWORD
    // =====================================================

    public static Specification<WarehouseEntity> hasKeyword(
            String keyword) {

        return (root, query, cb) -> {

            if (keyword == null || keyword.trim().isEmpty()) {
                return null;
            }

            String value = "%" + keyword.trim().toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("warehouseName")), value),
                    cb.like(cb.lower(root.get("warehouseCode")), value),
                    cb.like(cb.lower(root.get("contactPerson")), value),
                    cb.like(cb.lower(root.get("phone")), value),
                    cb.like(cb.lower(root.get("email")), value),
                    cb.like(cb.lower(root.get("city")), value),
                    cb.like(cb.lower(root.get("state")), value),
                    cb.like(cb.lower(root.get("pincode")), value),
                    cb.like(cb.lower(root.get("address")), value)
            );
        };
    }

    // =====================================================
    // STATUS
    // =====================================================

    public static Specification<WarehouseEntity> hasStatus(
            Status status) {

        return (root, query, cb) -> {

            if (status == null) {
                return null;
            }

            return cb.equal(
                    root.get("status"),
                    status
            );
        };
    }

    // =====================================================
    // ACTIVE
    // =====================================================

    public static Specification<WarehouseEntity> hasActive(
            Boolean active) {

        return (root, query, cb) -> {

            if (active == null) {
                return null;
            }

            return cb.equal(root.get("active"), active);
        };
    }

    // =====================================================
    // COMBINED FILTER
    // =====================================================

    public static Specification<WarehouseEntity> filter(
            String search,
            Status status,
            Boolean active) {

        return Specification
                .where(hasKeyword(search))
                .and(hasStatus(status))
                .and(hasActive(active));
    }
}
