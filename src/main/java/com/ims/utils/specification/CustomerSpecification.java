package com.ims.utils.specification;


import com.ims.entity.CustomerEntity;
import com.ims.enums.CustomerStatus;
import com.ims.enums.Status;
import org.springframework.data.jpa.domain.Specification;

public class CustomerSpecification {

    private CustomerSpecification() {
    }

    // =====================================================
    // SEARCH
    // =====================================================

    public static Specification<CustomerEntity> containsKeyword(
            String keyword) {

        return (root, query, cb) -> {

            if (keyword == null || keyword.isBlank()) {
                return null;
            }

            String search =
                    "%" + keyword.toLowerCase().trim() + "%";

            return cb.or(

                    cb.like(
                            cb.lower(root.get("displayName")),
                            search
                    ),

                    cb.like(
                            cb.lower(root.get("email")),
                            search
                    ),

                    cb.like(
                            cb.lower(root.get("customerType")),
                            search
                    ),

                    cb.like(
                            cb.lower(root.get("customerLanguage")),
                            search
                    )
            );
        };
    }


    // =====================================================
    // CUSTOMER TYPE
    // =====================================================

    public static Specification<CustomerEntity> hasCustomerType(
            String customerType) {

        return (root, query, cb) ->
                customerType == null
                        || customerType.isBlank()
                        ? null
                        : cb.equal(
                        cb.lower(
                                root.get("customerType")
                        ),
                        customerType.toLowerCase().trim()
                );
    }


    // =====================================================
    // STATUS
    // =====================================================

    public static Specification<CustomerEntity> hasStatus(
            CustomerStatus status) {

        return (root, query, cb) -> {

            if (status == null || status == CustomerStatus.ALL) {
                return null;
            }

            return cb.equal(root.get("status"), status);
        };
    }


    // =====================================================
    // ACTIVE / NOT DELETED
    // =====================================================

//    public static Specification<CustomerEntity> isActive() {
//
//        return (root, query, cb) ->
//                cb.isFalse(
//                        root.get("isDeleted")
//                );
//    }
}
