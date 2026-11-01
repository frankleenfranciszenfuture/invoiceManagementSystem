package com.ims.utils.specification;


import com.ims.entity.ExpenseEntity;
import com.ims.enums.ExpensePaymentStatus;
import com.ims.enums.ExpenseStatus;
import com.ims.enums.ExpenseType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class ExpenseSpecification {

    private ExpenseSpecification() {
    }

    public static Specification<ExpenseEntity> filter(
            String search,
            ExpenseType expenseType,
            Long categoryId,
            ExpenseStatus expenseStatus,
            ExpensePaymentStatus paymentStatus,
            LocalDate fromDate,
            LocalDate toDate,
            String vendorName,
            Long currencyId,
            Long warehouseId
    ) {
        return (root, query, cb) -> {

            var predicates = cb.conjunction();

            if (search != null && !search.isBlank()) {
                String value = "%" + search.trim().toLowerCase() + "%";

                predicates = cb.and(
                        predicates,
                        cb.or(
                                cb.like(cb.lower(root.get("expenseNo")), value),
                                cb.like(cb.lower(root.get("description")), value),
                                cb.like(cb.lower(root.get("referenceNo")), value),
                                cb.like(cb.lower(root.get("vendorName")), value)
                        )
                );
            }

            if (expenseType != null) {
                predicates = cb.and(
                        predicates,
                        cb.equal(root.get("expenseType"), expenseType)
                );
            }

            if (categoryId != null) {
                predicates = cb.and(
                        predicates,
                        cb.equal(
                                root.get("expenseCategory").get("id"),
                                categoryId
                        )
                );
            }

            if (expenseStatus != null) {
                predicates = cb.and(
                        predicates,
                        cb.equal(root.get("expenseStatus"), expenseStatus)
                );
            }

            if (paymentStatus != null) {
                predicates = cb.and(
                        predicates,
                        cb.equal(root.get("paymentStatus"), paymentStatus)
                );
            }

            if (fromDate != null) {
                predicates = cb.and(
                        predicates,
                        cb.greaterThanOrEqualTo(
                                root.get("expenseDate"),
                                fromDate
                        )
                );
            }

            if (toDate != null) {
                predicates = cb.and(
                        predicates,
                        cb.lessThanOrEqualTo(
                                root.get("expenseDate"),
                                toDate
                        )
                );
            }

            if (vendorName != null && !vendorName.isBlank()) {
                predicates = cb.and(
                        predicates,
                        cb.like(
                                cb.lower(root.get("vendorName")),
                                "%" + vendorName.trim().toLowerCase() + "%"
                        )
                );
            }

            if (currencyId != null) {
                predicates = cb.and(
                        predicates,
                        cb.equal(root.get("currencyId"), currencyId)
                );
            }

            if (warehouseId != null) {
                predicates = cb.and(
                        predicates,
                        cb.equal(root.get("warehouseId"), warehouseId)
                );
            }

            predicates = cb.and(
                    predicates,
                    cb.isTrue(root.get("active"))
            );

            return predicates;
        };
    }
}