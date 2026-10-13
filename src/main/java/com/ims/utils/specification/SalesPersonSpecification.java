package com.ims.utils.specification;

import com.ims.entity.PartyEntity;
import com.ims.entity.SalesPersonEntity;
import com.ims.enums.PartyType;
import com.ims.enums.SalesPersonType;
import com.ims.enums.Status;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class SalesPersonSpecification {

    private SalesPersonSpecification() {
    }


    //=====================================================
    // ACTIVE
    //=====================================================

    public static Specification<SalesPersonEntity> isActive() {

        return (root, query, cb) ->
                cb.isTrue(
                        root.get("active")
                );
    }


    //=====================================================
    // PARTY TYPE
    //=====================================================

    public static Specification<SalesPersonEntity> hasSalesPersonType(
            SalesPersonType salesPersonType) {

        return (root, query, cb) ->

                salesPersonType == null
                        ? null
                        : cb.equal(
                        root.get("salesPersonType"),
                        salesPersonType
                );
    }


    //=====================================================
    // STATUS
    //=====================================================

    public static Specification<SalesPersonEntity> hasStatus(
            Status status) {

        return (root, query, cb) ->

                status == null
                        ? null
                        : cb.equal(
                        root.get("status"),
                        status
                );
    }


    //=====================================================
    // SEARCH
    //=====================================================

    public static Specification<SalesPersonEntity> search(
            String search) {

        return (root, query, cb) -> {

            if (search == null || search.isBlank()) {
                return null;
            }

            String value =
                    "%" + search.toLowerCase() + "%";

            return cb.or(

                    cb.like(
                            cb.lower(
                                    root.get("partyCode")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("companyName")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("contactPerson")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("email")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("mobile")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("gstNumber")
                            ),
                            value
                    )
            );
        };
    }


    //=====================================================
    // MOBILE
    //=====================================================

    public static Specification<SalesPersonEntity> hasMobile(
            String mobile) {

        return (root, query, cb) ->

                mobile == null
                        ? null
                        : cb.equal(
                        root.get("mobile"),
                        mobile
                );
    }


    //=====================================================
    // CREATED DATE RANGE
    //=====================================================

    public static Specification<SalesPersonEntity> createdBetween(
            LocalDate fromDate,
            LocalDate toDate) {

        return (root, query, cb) -> {

            if (fromDate == null && toDate == null) {
                return null;
            }

            if (fromDate != null && toDate != null) {

                return cb.between(
                        root.get("createdAt"),
                        fromDate.atStartOfDay(),
                        toDate.plusDays(1)
                                .atStartOfDay()
                );
            }

            if (fromDate != null) {

                return cb.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        fromDate.atStartOfDay()
                );
            }

            return cb.lessThan(
                    root.get("createdAt"),
                    toDate.plusDays(1)
                            .atStartOfDay()
            );
        };
    }
}