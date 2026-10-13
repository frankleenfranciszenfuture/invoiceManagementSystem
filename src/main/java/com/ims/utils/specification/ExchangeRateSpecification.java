package com.ims.utils.specification;



import com.ims.entity.ExchangeRate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class ExchangeRateSpecification {

    private ExchangeRateSpecification() {}

    public static Specification<ExchangeRate> filter(
            String fromCode,
            String toCode,
            LocalDate fromDate,
            LocalDate toDate,
            Boolean active) {

        return (root, query, cb) -> {
            var predicates = cb.conjunction();

            if (fromCode != null && !fromCode.isBlank()) {
                predicates = cb.and(
                        predicates,
                        cb.equal(
                                cb.upper(
                                        root.join("fromCurrency").get("code")
                                ),
                                fromCode.trim().toUpperCase()
                        )
                );
            }

            if (toCode != null && !toCode.isBlank()) {
                predicates = cb.and(
                        predicates,
                        cb.equal(
                                cb.upper(
                                        root.join("toCurrency").get("code")
                                ),
                                toCode.trim().toUpperCase()
                        )
                );
            }

            if (fromDate != null) {
                predicates = cb.and(
                        predicates,
                        cb.greaterThanOrEqualTo(
                                root.get("effectiveDate"),
                                fromDate
                        )
                );
            }

            if (toDate != null) {
                predicates = cb.and(
                        predicates,
                        cb.lessThanOrEqualTo(
                                root.get("effectiveDate"),
                                toDate
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
}
