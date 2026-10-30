
package com.ims.utils.specification;

import com.ims.dtos.saleOrder.SalesOrderSearchRequest;
import com.ims.entity.SalesOrderEntity;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public final class SaleOrderSpecification {

    private SaleOrderSpecification() {
    }

    public static Specification<SalesOrderEntity> withFilters(
            SalesOrderSearchRequest filter
    ) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            // Active orders only
            predicates.add(
                    cb.isTrue(root.get("active"))
            );

            if (filter == null) {
                return cb.and(predicates.toArray(new Predicate[0]));
            }

            // Search across order number and party information
            if (StringUtils.hasText(filter.getSearch())) {

                String search =
                        "%" + filter.getSearch().trim().toLowerCase() + "%";

                Join<Object, Object> party = root.join(
                        "party",
                        JoinType.LEFT
                );

                predicates.add(
                        cb.or(
                                cb.like(
                                        cb.lower(root.get("orderNo")),
                                        search
                                ),
                                cb.like(
                                        cb.lower(party.get("partyName")),
                                        search
                                ),
                                cb.like(
                                        cb.lower(party.get("partyCode")),
                                        search
                                ),
                                cb.like(
                                        cb.lower(party.get("mobileNumber")),
                                        search
                                )
                        )
                );
            }

            // Order number
            if (StringUtils.hasText(filter.getOrderNo())) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("orderNo")),
                                "%" + filter.getOrderNo().trim().toLowerCase() + "%"
                        )
                );
            }

            // Party type
            if (filter.getPartyType() != null) {

                predicates.add(
                        cb.equal(
                                root.get("partyType"),
                                filter.getPartyType()
                        )
                );
            }

            // Customer
            if (filter.getCustomerId() != null) {

                predicates.add(
                        cb.equal(
                                root.get("customer").get("id"),
                                filter.getCustomerId()
                        )
                );
            }

            // Party
            if (filter.getPartyId() != null) {

                predicates.add(
                        cb.equal(
                                root.get("party").get("id"),
                                filter.getPartyId()
                        )
                );
            }

            // Warehouse
            if (filter.getWarehouseId() != null) {

                predicates.add(
                        cb.equal(
                                root.get("warehouse").get("id"),
                                filter.getWarehouseId()
                        )
                );
            }

            // Currency
            if (filter.getCurrencyId() != null) {

                predicates.add(
                        cb.equal(
                                root.get("currency").get("id"),
                                filter.getCurrencyId()
                        )
                );
            }

            // Sales order status
            if (filter.getSalesOrderStatus() != null) {

                predicates.add(
                        cb.equal(
                                root.get("salesOrderStatus"),
                                filter.getSalesOrderStatus()
                        )
                );
            }

            // From date
            if (filter.getFromDate() != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("orderDate"),
                                filter.getFromDate()
                        )
                );
            }

            // To date
            if (filter.getToDate() != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("orderDate"),
                                filter.getToDate()
                        )
                );
            }

            if (query != null) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
