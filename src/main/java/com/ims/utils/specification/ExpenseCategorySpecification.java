package com.ims.utils.specification;



import com.ims.entity.ExpenseCategoryEntity;
import com.ims.enums.ExpenseCategoryStatus;
import com.ims.enums.ExpenseType;
import org.springframework.data.jpa.domain.Specification;

public final class ExpenseCategorySpecification {

    private ExpenseCategorySpecification() {
    }

    public static Specification<ExpenseCategoryEntity> search(
            String search,
            ExpenseType expenseType,
            ExpenseCategoryStatus status
    ) {
        return (root, query, cb) -> {

            var predicates = cb.conjunction();

            if (search != null && !search.isBlank()) {
                String value = "%" + search.trim().toLowerCase() + "%";

                predicates = cb.and(
                        predicates,
                        cb.or(
                                cb.like(
                                        cb.lower(root.get("categoryCode")),
                                        value
                                ),
                                cb.like(
                                        cb.lower(root.get("categoryName")),
                                        value
                                )
                        )
                );
            }

            if (expenseType != null) {
                predicates = cb.and(
                        predicates,
                        cb.equal(root.get("expenseType"), expenseType)
                );
            }

            if (status != null) {
                predicates = cb.and(
                        predicates,
                        cb.equal(root.get("status"), status)
                );
            }

            return predicates;
        };
    }
}