package com.ims.utils.specification;

import com.ims.entity.CashAccountEntity;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public final class CashAccountSpecification {

    private CashAccountSpecification() {
    }

    public static Specification<CashAccountEntity> search(String search) {

        return (root, query, cb) -> {

            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }

            String value = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("accountName")), value),
                    cb.like(cb.lower(root.get("accountCode")), value),
                    cb.like(cb.lower(root.get("currency")), value),
                    cb.like(cb.lower(root.get("description")), value)
            );
        };
    }

    public static Specification<CashAccountEntity> hasStatus(String status) {

        return (root, query, cb) -> {

            if (status == null || status.isBlank()) {
                return cb.conjunction();
            }

            return cb.equal(
                    cb.upper(root.get("status")),
                    status.trim().toUpperCase(Locale.ROOT)
            );
        };
    }

    public static Specification<CashAccountEntity> isActive() {

        return (root, query, cb) ->
                cb.isTrue(root.get("active"));
    }
}