package com.ims.utils.specification;

import com.ims.dtos.bankAccount.BankAccountSearchRequest;
import com.ims.entity.BankAccount;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class BankAccountSpecification {

    private BankAccountSpecification() {
    }


    public static Specification<BankAccount> filter(
            BankAccountSearchRequest request
    ) {

        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates =
                    new ArrayList<>();


            // =================================================
            // SEARCH
            // =================================================

            if (StringUtils.hasText(
                    request.getSearch()
            )) {

                String search =
                        "%"
                                + request
                                .getSearch()
                                .trim()
                                .toLowerCase()
                                + "%";

                Predicate searchPredicate =
                        criteriaBuilder.or(

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get(
                                                        "accountName"
                                                )
                                        ),
                                        search
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get(
                                                        "accountCode"
                                                )
                                        ),
                                        search
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get(
                                                        "accountNumber"
                                                )
                                        ),
                                        search
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get(
                                                        "bankName"
                                                )
                                        ),
                                        search
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get(
                                                        "ifsc"
                                                )
                                        ),
                                        search
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get(
                                                        "currency"
                                                )
                                        ),
                                        search
                                ),

                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get(
                                                        "description"
                                                )
                                        ),
                                        search
                                )
                        );

                predicates.add(
                        searchPredicate
                );
            }


            // =================================================
            // ACCOUNT TYPE
            // =================================================

            if (request.getAccountType() != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("accountType"),
                                request.getAccountType()
                        )
                );
            }


            // =================================================
            // ACCOUNT NAME
            // =================================================

            if (StringUtils.hasText(
                    request.getAccountName()
            )) {

                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get(
                                                "accountName"
                                        )
                                ),
                                "%"
                                        + request
                                        .getAccountName()
                                        .trim()
                                        .toLowerCase()
                                        + "%"
                        )
                );
            }


            // =================================================
            // ACCOUNT CODE
            // =================================================

            if (StringUtils.hasText(
                    request.getAccountCode()
            )) {

                predicates.add(
                        criteriaBuilder.equal(
                                criteriaBuilder.lower(
                                        root.get(
                                                "accountCode"
                                        )
                                ),
                                request
                                        .getAccountCode()
                                        .trim()
                                        .toLowerCase()
                        )
                );
            }


            // =================================================
            // CURRENCY
            // =================================================

            if (StringUtils.hasText(
                    request.getCurrency()
            )) {

                predicates.add(
                        criteriaBuilder.equal(
                                criteriaBuilder.lower(
                                        root.get(
                                                "currency"
                                        )
                                ),
                                request
                                        .getCurrency()
                                        .trim()
                                        .toLowerCase()
                        )
                );
            }


            // =================================================
            // ACCOUNT NUMBER
            // =================================================

            if (StringUtils.hasText(
                    request.getAccountNumber()
            )) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get(
                                        "accountNumber"
                                ),
                                request
                                        .getAccountNumber()
                                        .trim()
                        ));
            }


            // =================================================
            // BANK NAME
            // =================================================

            if (StringUtils.hasText(
                    request.getBankName()
            )) {

                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get(
                                                "bankName"
                                        )
                                ),
                                "%"
                                        + request
                                        .getBankName()
                                        .trim()
                                        .toLowerCase()
                                        + "%"
                        )
                );
            }


            // =================================================
            // IFSC
            // =================================================

            if (StringUtils.hasText(
                    request.getIfsc()
            )) {

                predicates.add(
                        criteriaBuilder.equal(
                                criteriaBuilder.lower(
                                        root.get("ifsc")
                                ),
                                request
                                        .getIfsc()
                                        .trim()
                                        .toLowerCase()
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
            // PRIMARY
            // =================================================

            if (request.getPrimaryAccount() != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get(
                                        "primaryAccount"
                                ),
                                request.getPrimaryAccount()
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


            return criteriaBuilder.and(
                    predicates.toArray(
                            new Predicate[0]
                    )
            );
        };
    }
}