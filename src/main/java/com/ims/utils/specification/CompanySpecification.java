package com.ims.utils.specification;


import com.ims.dtos.company.CompanySearchRequest;
import com.ims.entity.CompanyDetails;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class CompanySpecification {

    private CompanySpecification() {
    }


    // =====================================================
    // SEARCH
    // =====================================================

    public static Specification<CompanyDetails> filter(
            CompanySearchRequest request
    ) {

        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates = new ArrayList<>();


            // =================================================
            // GENERAL SEARCH
            // =================================================

            if (StringUtils.hasText(request.getSearch())) {

                String search = "%" +
                        request.getSearch()
                                .trim()
                                .toLowerCase() +
                        "%";

                predicates.add(
                        criteriaBuilder.or(

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("companyName")
                                        ),
                                        search
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("displayName")
                                        ),
                                        search
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("legalName")
                                        ),
                                        search
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("companyCode")
                                        ),
                                        search
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("gstNumber")
                                        ),
                                        search
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("panNumber")
                                        ),
                                        search
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("phone")
                                        ),
                                        search
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("email")
                                        ),
                                        search
                                )
                        )
                );
            }


            // =================================================
            // COMPANY NAME
            // =================================================

            if (StringUtils.hasText(request.getCompanyName())) {

                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("companyName")
                                ),
                                "%" +
                                        request.getCompanyName()
                                                .trim()
                                                .toLowerCase() +
                                        "%"
                        )
                );
            }


            // =================================================
            // COMPANY CODE
            // =================================================

            if (StringUtils.hasText(request.getCompanyCode())) {

                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("companyCode")
                                ),
                                "%" +
                                        request.getCompanyCode()
                                                .trim()
                                                .toLowerCase() +
                                        "%"
                        )
                );
            }


            // =================================================
            // GST NUMBER
            // =================================================

            if (StringUtils.hasText(request.getGstNumber())) {

                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("gstNumber")
                                ),
                                "%" +
                                        request.getGstNumber()
                                                .trim()
                                                .toLowerCase() +
                                        "%"
                        )
                );
            }


            // =================================================
            // PAN NUMBER
            // =================================================

            if (StringUtils.hasText(request.getPanNumber())) {

                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("panNumber")
                                ),
                                "%" +
                                        request.getPanNumber()
                                                .trim()
                                                .toLowerCase() +
                                        "%"
                        )
                );
            }


            // =================================================
            // PHONE
            // =================================================

            if (StringUtils.hasText(request.getPhone())) {

                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("phone")
                                ),
                                "%" +
                                        request.getPhone()
                                                .trim()
                                                .toLowerCase() +
                                        "%"
                        )
                );
            }


            // =================================================
            // EMAIL
            // =================================================

            if (StringUtils.hasText(request.getEmail())) {

                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("email")
                                ),
                                "%" +
                                        request.getEmail()
                                                .trim()
                                                .toLowerCase() +
                                        "%"
                        )
                );
            }


            // =================================================
            // CITY
            // =================================================

            if (StringUtils.hasText(request.getCity())) {

                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("city")
                                ),
                                "%" +
                                        request.getCity()
                                                .trim()
                                                .toLowerCase() +
                                        "%"
                        )
                );
            }


            // =================================================
            // STATE
            // =================================================

            if (StringUtils.hasText(request.getState())) {

                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("state")
                                ),
                                "%" +
                                        request.getState()
                                                .trim()
                                                .toLowerCase() +
                                        "%"
                        )
                );
            }


            // =================================================
            // STATUS
            // =================================================

            if (request.getStatus() != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("status"),
                                request.getStatus()
                        )
                );
            }


            // =================================================
            // ACTIVE
            // =================================================

            if (request.getActive() != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("active"),
                                request.getActive()
                        )
                );
            }


            // =================================================
            // RETURN
            // =================================================

            return criteriaBuilder.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }
}
