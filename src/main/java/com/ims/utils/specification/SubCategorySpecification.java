package com.ims.utils.specification;


import com.ims.entity.SubCategoryEntity;
import org.springframework.data.jpa.domain.Specification;

public class SubCategorySpecification {


    // =====================================================
    // KEYWORD SEARCH
    // =====================================================

    public static Specification<SubCategoryEntity> hasKeyword(
            String keyword
    ) {

        return (root, query, cb) -> {

            if (keyword == null || keyword.trim().isEmpty()) {
                return null;
            }

            String search =
                    "%" + keyword.trim().toLowerCase() + "%";

            return cb.or(

                    cb.like(
                            cb.lower(root.get("name")),
                            search
                    ),

                    cb.like(
                            cb.lower(root.get("subCategoryCode")),
                            search
                    )

            );
        };
    }


    // =====================================================
    // CATEGORY FILTER
    // =====================================================

    public static Specification<SubCategoryEntity> hasCategory(
            Long categoryId
    ) {

        return (root, query, cb) -> {

            if (categoryId == null) {
                return null;
            }

            return cb.equal(
                    root.get("category").get("id"),
                    categoryId
            );
        };
    }


    // =====================================================
    // ACTIVE FILTER
    // =====================================================

    public static Specification<SubCategoryEntity> hasActive(
            Boolean active
    ) {

        return (root, query, cb) -> {

            if (active == null) {
                return null;
            }

            return cb.equal(
                    root.get("active"),
                    active
            );
        };
    }
}
