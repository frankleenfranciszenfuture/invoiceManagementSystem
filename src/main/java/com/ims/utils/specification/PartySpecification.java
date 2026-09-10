package com.ims.utils.specification;


import com.ims.entity.PartyEntity;
import com.ims.enums.PartyType;
import com.ims.enums.Status;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class PartySpecification {

    private PartySpecification() {
    }


    //=====================================================
    // ACTIVE
    //=====================================================

    public static Specification<PartyEntity> isActive() {

        return (root, query, cb) ->
                cb.isTrue(
                        root.get("active")
                );
    }


    //=====================================================
    // PARTY TYPE
    //=====================================================

    public static Specification<PartyEntity> hasPartyType(
            PartyType partyType) {

        return (root, query, cb) ->

                partyType == null
                        ? null
                        : cb.equal(
                        root.get("partyType"),
                        partyType
                );
    }


    //=====================================================
    // STATUS
    //=====================================================

    public static Specification<PartyEntity> hasStatus(
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

    public static Specification<PartyEntity> search(
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
    // COMPANY NAME
    //=====================================================

    public static Specification<PartyEntity> companyName(
            String companyName) {

        return (root, query, cb) -> {

            if (companyName == null ||
                    companyName.isBlank()) {

                return null;
            }

            return cb.like(
                    cb.lower(
                            root.get("companyName")
                    ),
                    "%" + companyName.toLowerCase() + "%"
            );
        };
    }


    //=====================================================
    // MOBILE
    //=====================================================

    public static Specification<PartyEntity> hasMobile(
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
    // GST
    //=====================================================

    public static Specification<PartyEntity> hasGstNumber(
            String gstNumber) {

        return (root, query, cb) ->

                gstNumber == null
                        ? null
                        : cb.equal(
                        root.get("gstNumber"),
                        gstNumber
                );
    }


    //=====================================================
    // CREATED DATE RANGE
    //=====================================================

    public static Specification<PartyEntity> createdBetween(
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