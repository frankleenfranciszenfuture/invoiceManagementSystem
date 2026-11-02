package com.ims.utils.specification;

import com.ims.entity.PaymentEntity;
import com.ims.enums.PaymentDirection;
import com.ims.enums.PaymentMethod;
import com.ims.enums.PaymentStatus;
import com.ims.enums.PaymentType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class PaymentSpecification {

    private PaymentSpecification() {
    }

    public static Specification<PaymentEntity> filter(
            PaymentType paymentType,
            PaymentDirection paymentDirection,
            PaymentMethod paymentMethod,
            PaymentStatus paymentStatus,
            Long sourceId,
            LocalDate fromDate,
            LocalDate toDate,
            String search
    ) {
        return (root, query, cb) -> {

            var predicates = cb.conjunction();

            predicates.getExpressions().add(
                    cb.isTrue(root.get("active"))
            );

            if (paymentType != null) {
                predicates.getExpressions().add(
                        cb.equal(root.get("paymentType"), paymentType)
                );
            }

            if (paymentDirection != null) {
                predicates.getExpressions().add(
                        cb.equal(root.get("paymentDirection"), paymentDirection)
                );
            }

            if (paymentMethod != null) {
                predicates.getExpressions().add(
                        cb.equal(root.get("paymentMethod"), paymentMethod)
                );
            }

            if (paymentStatus != null) {
                predicates.getExpressions().add(
                        cb.equal(root.get("paymentStatus"), paymentStatus)
                );
            }

            if (sourceId != null) {
                predicates.getExpressions().add(
                        cb.equal(root.get("sourceId"), sourceId)
                );
            }

            if (fromDate != null) {
                predicates.getExpressions().add(
                        cb.greaterThanOrEqualTo(
                                root.get("paymentDate"),
                                fromDate
                        )
                );
            }

            if (toDate != null) {
                predicates.getExpressions().add(
                        cb.lessThanOrEqualTo(
                                root.get("paymentDate"),
                                toDate
                        )
                );
            }

            if (search != null && !search.isBlank()) {
                String value = "%" + search.trim().toLowerCase() + "%";

                predicates.getExpressions().add(
                        cb.or(
                                cb.like(
                                        cb.lower(root.get("paymentNumber")),
                                        value
                                ),
                                cb.like(
                                        cb.lower(root.get("sourceNumber")),
                                        value
                                ),
                                cb.like(
                                        cb.lower(root.get("referenceNumber")),
                                        value
                                )
                        )
                );
            }

            return predicates;
        };
    }
}