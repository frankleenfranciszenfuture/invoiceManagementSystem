package com.ims.utils.specification;



import com.ims.entity.Currency;
import com.ims.enums.CurrencyStatus;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public final class CurrencySpecification {

    private CurrencySpecification() {}

    public static Specification<Currency> filter(
            String search,
            Boolean active) {

        return (root, query, cb) -> {
            var predicates = cb.conjunction();

            if (search != null && !search.isBlank()) {
                String value = "%"
                        + search.trim().toLowerCase(Locale.ROOT)
                        + "%";

                predicates = cb.and(
                        predicates,
                        cb.or(
                                cb.like(
                                        cb.lower(root.get("code")),
                                        value
                                ),
                                cb.like(
                                        cb.lower(root.get("name")),
                                        value
                                ),
                                cb.like(
                                        cb.lower(root.get("symbol")),
                                        value
                                )
                        )
                );
            }

            if (active != null) {
                predicates = cb.and(
                        predicates,
                        cb.equal(root.get("active"), active)
                );
            }

            return predicates;
        };
    }

    public static Specification<Currency> isNotDeleted() {

        return (root, query, cb) ->
                cb.notEqual(
                        root.get("status"),
                        CurrencyStatus.DELETED
                );
    }
}
