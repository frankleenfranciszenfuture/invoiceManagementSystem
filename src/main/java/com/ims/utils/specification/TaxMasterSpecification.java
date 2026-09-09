package com.ims.utils.specification;

import com.ims.entity.TaxMasterEntity;
import com.ims.enums.Status;
import com.ims.enums.TaxType;
import org.springframework.data.jpa.domain.Specification;

public class TaxMasterSpecification {

    private TaxMasterSpecification() {
    }

    // =====================================================
    // SEARCH
    // =====================================================

    public static Specification<TaxMasterEntity> containsKeyword(
            String keyword) {

        return (root, query, cb) -> {

            if (keyword == null || keyword.isBlank()) {
                return null;
            }

            String search =
                    "%" + keyword.toLowerCase() + "%";

            return cb.or(

                    cb.like(
                            cb.lower(root.get("taxName")),
                            search
                    ),

                    cb.like(
                            cb.lower(root.get("description")),
                            search
                    ),

                    cb.like(
                            cb.lower(root.get("taxType")),
                            search
                    )
            );
        };
    }

    // =====================================================
    // TAX TYPE
    // =====================================================

    public static Specification<TaxMasterEntity> hasTaxType(
            TaxType taxType) {

        return (root, query, cb) ->
                taxType == null
                        ? null
                        : cb.equal(
                        root.get("taxType"),
                        taxType
                );
    }

    // =====================================================
    // STATUS
    // =====================================================

    public static Specification<TaxMasterEntity> hasStatus(
            Status status) {

        return (root, query, cb) ->
                status == null
                        ? null
                        : cb.equal(
                        root.get("status"),
                        status
                );
    }

    // =====================================================
    // ACTIVE
    // =====================================================

    public static Specification<TaxMasterEntity> isActive() {

        return (root, query, cb) ->
                cb.isTrue(
                        root.get("active")
                );
    }
}