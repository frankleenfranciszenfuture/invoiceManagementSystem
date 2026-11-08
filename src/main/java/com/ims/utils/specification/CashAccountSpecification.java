package com.ims.utils.specification;

import com.ims.entity.CashAccountEntity;
import com.ims.enums.CashAccountStatus;

import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public final class CashAccountSpecification {

    private CashAccountSpecification() {
    }

    // ==========================================
    // SEARCH
    // ==========================================

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

    // ==========================================
    // STATUS FILTER
    // ==========================================

    public static Specification<CashAccountEntity> hasStatus(String status) {

        return (root, query, cb) -> {

            // Never return deleted accounts.
            var notDeleted = cb.notEqual(
                    cb.upper(root.get("status")),
                    CashAccountStatus.DELETED.name()
            );

            if (status == null || status.isBlank()
                    || CashAccountStatus.ALL.name().equalsIgnoreCase(status.trim())) {

                return cb.and(
                        notDeleted,
                        cb.equal(
                                cb.upper(root.get("status")),
                                CashAccountStatus.ACTIVE.name()
                        )
                );
            }

            if (CashAccountStatus.DELETED.name().equalsIgnoreCase(status.trim())) {
                return cb.disjunction();
            }

            return cb.and(
                    notDeleted,
                    cb.equal(
                            cb.upper(root.get("status")),
                            status.trim().toUpperCase(Locale.ROOT)
                    )
            );
        };
    }

    // ==========================================
    // EXCLUDE DELETED ACCOUNTS
    // ==========================================

    public static Specification<CashAccountEntity> isNotDeleted() {

        return (root, query, cb) ->
                cb.notEqual(
                        cb.upper(root.get("status")),
                        CashAccountStatus.DELETED.name()
                );
    }
}