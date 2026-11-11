
package com.ims.utils.specification;

import com.ims.entity.WarehouseEntity;
import com.ims.enums.Status;
import com.ims.enums.reports.WarehouseStatus;

import jakarta.persistence.criteria.Predicate;

import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

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
    // BUSINESS STATUS
    // =====================================================

    public static Specification<WarehouseEntity> hasStatus(
            Status status) {

        return (root, query, cb) -> {

            if (status == null) {
                return null;
            }

            return cb.equal(root.get("status"), status);
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
            WarehouseStatus status) {

        WarehouseStatus selectedStatus =
                status != null ? status : WarehouseStatus.ACTIVE;

        Specification<WarehouseEntity> specification =
                Specification.where(hasKeyword(search));

        switch (selectedStatus) {

            case ALL -> specification =
                    specification.and(hasActive(true));

            case ACTIVE -> specification =
                    specification
                            .and(hasActive(true))
                            .and(hasStatus(Status.ACTIVE));

            case INACTIVE -> specification =
                    specification
                            .and(hasActive(true))
                            .and(hasStatus(Status.INACTIVE));

            case DELETED -> specification =
                    specification.and(hasActive(false));
        }

        return specification;
    }
}
