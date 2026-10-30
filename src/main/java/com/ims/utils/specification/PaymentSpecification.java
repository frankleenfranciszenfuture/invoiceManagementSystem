package com.ims.utils.specification;

import com.ims.dtos.payment.PaymentFilterDTO;
import com.ims.entity.PaymentEntity;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public final class PaymentSpecification {

    private PaymentSpecification() {
    }

    public static Specification<PaymentEntity> withFilters(
            PaymentFilterDTO filter
    ) {

        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates = new ArrayList<>();

            // Active records only.
            predicates.add(
                    criteriaBuilder.isTrue(root.get("active"))
            );

            if (filter == null) {
                return criteriaBuilder.and(
                        predicates.toArray(new Predicate[0])
                );
            }

            // Search payment number, transaction reference and party details.
            if (filter.getSearch() != null &&
                    !filter.getSearch().trim().isEmpty()) {

                String search = "%"
                        + filter.getSearch().trim().toLowerCase()
                        + "%";

                Join<Object, Object> partyJoin =
                        root.join("party", JoinType.LEFT);

                predicates.add(
                        criteriaBuilder.or(
                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("paymentNumber")
                                        ),
                                        search
                                ),
                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("transactionReference")
                                        ),
                                        search
                                ),
                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                partyJoin.get("companyName")
                                        ),
                                        search
                                ),
                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                partyJoin.get("partyCode")
                                        ),
                                        search
                                )
                        )
                );
            }

            // Party filter.
            if (filter.getPartyId() != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("party").get("id"),
                                filter.getPartyId()
                        )
                );
            }

            // Bank account filter.
            if (filter.getBankAccountId() != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("bankAccount").get("id"),
                                filter.getBankAccountId()
                        )
                );
            }

            // Payment direction.
            if (filter.getDirection() != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("direction"),
                                filter.getDirection()
                        )
                );
            }

            // Reference type.
            if (filter.getReferenceType() != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("referenceType"),
                                filter.getReferenceType()
                        )
                );
            }

            // Payment method.
            if (filter.getPaymentMethod() != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("paymentMethod"),
                                filter.getPaymentMethod()
                        )
                );
            }

            // Payment status.
            if (filter.getStatus() != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("status"),
                                filter.getStatus()
                        )
                );
            }

            // From date.
            if (filter.getFromDate() != null) {

                predicates.add(
                        criteriaBuilder.greaterThanOrEqualTo(
                                root.get("paymentDate"),
                                filter.getFromDate()
                        )
                );
            }

            // To date.
            if (filter.getToDate() != null) {

                predicates.add(
                        criteriaBuilder.lessThanOrEqualTo(
                                root.get("paymentDate"),
                                filter.getToDate()
                        )
                );
            }

            if (filter.getFromDate() != null &&
                    filter.getToDate() != null &&
                    filter.getFromDate().isAfter(filter.getToDate())) {

                throw new IllegalArgumentException(
                        "From date cannot be after to date"
                );
            }

            return criteriaBuilder.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }
}

