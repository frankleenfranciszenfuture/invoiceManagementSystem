package com.ims.utils.specification;


import com.ims.dtos.purchaseOrder.PurchaseOrderSearchRequest;
import com.ims.entity.PurchaseOrderEntity;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class PurchaseOrderSpecification {

    private PurchaseOrderSpecification() {
    }

    public static Specification<PurchaseOrderEntity> withFilters(
            PurchaseOrderSearchRequest request
    ) {

        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates = new ArrayList<>();

            // Only active Purchase Orders
            predicates.add(
                    criteriaBuilder.isTrue(root.get("active"))
            );

            if (request == null) {
                return criteriaBuilder.and(
                        predicates.toArray(new Predicate[0])
                );
            }

            // Supplier join
            Join<Object, Object> party =
                    root.join("party", JoinType.LEFT);

            // General keyword search
            if (hasText(request.getSearch())) {

                String search = "%" +
                        request.getSearch().trim().toLowerCase(Locale.ROOT) +
                        "%";

                Predicate searchPredicate = criteriaBuilder.or(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("orderNo")),
                                search
                        ),
                        criteriaBuilder.like(
                                criteriaBuilder.lower(party.get("companyName")),
                                search
                        ),
                        criteriaBuilder.like(
                                criteriaBuilder.lower(party.get("contactPerson")),
                                search
                        ),
                        criteriaBuilder.like(
                                criteriaBuilder.lower(party.get("mobile")),
                                search
                        ),
                        criteriaBuilder.like(
                                criteriaBuilder.lower(party.get("partyCode")),
                                search
                        )
                );

                predicates.add(searchPredicate);
            }

            // Purchase Order number
            if (hasText(request.getOrderNo())) {

                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("orderNo")),
                                "%" + request.getOrderNo().trim().toLowerCase(Locale.ROOT) + "%"
                        )
                );
            }

            // Supplier
            if (request.getPartyId() != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                party.get("id"),
                                request.getPartyId()
                        )
                );
            }

            // Warehouse
            if (request.getWarehouseId() != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("warehouse").get("id"),
                                request.getWarehouseId()
                        )
                );
            }

            // Currency
            if (request.getCurrencyId() != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("currency").get("id"),
                                request.getCurrencyId()
                        )
                );
            }

            // Status
            if (request.getPurchaseOrderStatus() != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("purchaseOrderStatus"),
                                request.getPurchaseOrderStatus()
                        )
                );
            }

            // From date
            if (request.getFromDate() != null) {

                predicates.add(
                        criteriaBuilder.greaterThanOrEqualTo(
                                root.get("orderDate"),
                                request.getFromDate()
                        )
                );
            }

            // To date
            if (request.getToDate() != null) {

                predicates.add(
                        criteriaBuilder.lessThanOrEqualTo(
                                root.get("orderDate"),
                                request.getToDate()
                        )
                );
            }

            query.distinct(true);

            return criteriaBuilder.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
