
package com.ims.utils.specification;

import com.ims.entity.BankTransactionEntity;
import com.ims.enums.BankTransactionDirection;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public final class BankTransactionSpecification {

    private BankTransactionSpecification() {
    }

    public static Specification<BankTransactionEntity> withFilters(
            Long bankAccountId,
            LocalDate fromDate,
            LocalDate toDate,
            BankTransactionDirection direction,
            String search
    ) {

        // Validate date range before creating the specification.
        if (fromDate != null &&
                toDate != null &&
                fromDate.isAfter(toDate)) {

            throw new IllegalArgumentException(
                    "From date cannot be after to date"
            );
        }

        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates = new ArrayList<>();

            // Active transactions only.
            predicates.add(
                    criteriaBuilder.isTrue(root.get("active"))
            );

            // Bank account filter.
            if (bankAccountId != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("bankAccount").get("id"),
                                bankAccountId
                        )
                );
            }

            // Transaction direction.
            if (direction != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("direction"),
                                direction
                        )
                );
            }

            // From date.
            if (fromDate != null) {

                predicates.add(
                        criteriaBuilder.greaterThanOrEqualTo(
                                root.get("transactionDate"),
                                fromDate
                        )
                );
            }

            // To date.
            if (toDate != null) {

                predicates.add(
                        criteriaBuilder.lessThanOrEqualTo(
                                root.get("transactionDate"),
                                toDate
                        )
                );
            }

            // Search filters.
            if (search != null && !search.isBlank()) {

                String keyword = "%"
                        + search.trim().toLowerCase()
                        + "%";

                Join<Object, Object> partyJoin =
                        root.join("party", JoinType.LEFT);

                Join<Object, Object> paymentJoin =
                        root.join("payment", JoinType.LEFT);

                Join<Object, Object> bankAccountJoin =
                        root.join("bankAccount", JoinType.LEFT);

                predicates.add(
                        criteriaBuilder.or(

                                // Transaction number.
                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("transactionNumber")
                                        ),
                                        keyword
                                ),

                                // Reference number.
                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("referenceNumber")
                                        ),
                                        keyword
                                ),

                                // Description.
                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("description")
                                        ),
                                        keyword
                                ),

                                // Party name.
                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                partyJoin.get("companyName")
                                        ),
                                        keyword
                                ),

                                // Payment number.
                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                paymentJoin.get("paymentNumber")
                                        ),
                                        keyword
                                ),

                                // Bank account name.
                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                bankAccountJoin.get("accountName")
                                        ),
                                        keyword
                                )
                        )
                );
            }

            if (query != null) {
                query.distinct(true);
            }

            return criteriaBuilder.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }
}
