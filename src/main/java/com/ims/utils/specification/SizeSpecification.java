package com.ims.utils.specification;


import com.ims.entity.SizeEntity;
import com.ims.enums.Status;
import org.springframework.data.jpa.domain.Specification;

public class SizeSpecification {

    private SizeSpecification() {
    }



    //=====================================================
    // SEARCH
    //=====================================================

    public static Specification<SizeEntity> containsKeyword(
            String keyword) {

        return (root, query, cb) -> {

            if (keyword == null || keyword.isBlank()) {
                return null;
            }

            String search = "%" + keyword.toLowerCase() + "%";

            return cb.or(

                    cb.like(
                            cb.lower(root.get("sizeName")),
                            search
                    ),

                    cb.like(
                            cb.lower(root.get("sizeCode")),
                            search
                    )
            );
        };
    }

    //=====================================================
    // STATUS
    //=====================================================

    public static Specification<SizeEntity> hasStatus(Status status) {

        return (root, query, cb) -> {

            if (status == null) {
                return null;
            }

            if (status == Status.ACTIVE) {
                return cb.isTrue(root.get("active"));
            }

            if (status == Status.INACTIVE) {
                return cb.isFalse(root.get("active"));
            }

            return null;
        };
    }

    //=====================================================
    // ACTIVE
    //=====================================================

    public static Specification<SizeEntity> isActive() {

        return (root, query, cb) ->
                cb.isTrue(
                        root.get("active")
                );
    }

}