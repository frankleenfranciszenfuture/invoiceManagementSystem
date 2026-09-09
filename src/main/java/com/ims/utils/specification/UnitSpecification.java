package com.ims.utils.specification;


import com.ims.entity.UnitEntity;
import com.ims.enums.Status;
import org.springframework.data.jpa.domain.Specification;

public class UnitSpecification {

    private UnitSpecification() {
    }

    // =====================================================
    // SEARCH
    // =====================================================

    public static Specification<UnitEntity> containsKeyword(
            String keyword) {

        return (root, query, cb) -> {

            if (keyword == null || keyword.isBlank()) {
                return null;
            }

            String search =
                    "%" + keyword.trim().toLowerCase() + "%";

            return cb.or(

                    cb.like(
                            cb.lower(
                                    root.get("unitCode")
                            ),
                            search
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("unitName")
                            ),
                            search
                    )
            );
        };
    }

    // =====================================================
    // STATUS
    // =====================================================

    public static Specification<UnitEntity> hasStatus(
            Status status) {

        return (root, query, cb) -> {

            if (status == null) {
                return null;
            }

            if (status == Status.ACTIVE) {
                return cb.isTrue(
                        root.get("active")
                );
            }

            if (status == Status.INACTIVE) {
                return cb.isFalse(
                        root.get("active")
                );
            }

            return null;
        };
    }

    // =====================================================
    // ACTIVE
    // =====================================================

    public static Specification<UnitEntity> isActive() {

        return (root, query, cb) ->
                cb.isTrue(
                        root.get("active")
                );
    }
}
