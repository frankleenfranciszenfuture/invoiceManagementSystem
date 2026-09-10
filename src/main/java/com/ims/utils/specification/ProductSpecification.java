package com.ims.utils.specification;


import com.ims.entity.ProductEntity;
import com.ims.enums.Status;
import org.springframework.data.jpa.domain.Specification;

public final class ProductSpecification {

    private ProductSpecification() {
    }


    // =====================================================
    // KEYWORD
    // =====================================================

    public static Specification<ProductEntity> containsKeyword(
            String keyword
    ) {

        if (keyword == null || keyword.isBlank()) {
            return Specification.unrestricted();
        }

        String search =
                "%" + keyword.trim().toLowerCase() + "%";

        return (root, query, cb) -> cb.or(

                cb.like(
                        cb.lower(root.get("productName")),
                        search
                ),

                cb.like(
                        cb.lower(root.get("productCode")),
                        search
                ),

                cb.like(
                        cb.lower(root.get("sku")),
                        search
                ),

                cb.like(
                        cb.lower(root.get("brand")),
                        search
                ),

                cb.like(
                        cb.lower(root.get("hsnCode")),
                        search
                )
        );
    }


    // =====================================================
    // SEARCH
    // =====================================================

    public static Specification<ProductEntity> search(
            String search
    ) {

        if (search == null || search.isBlank()) {
            return Specification.unrestricted();
        }

        String value =
                "%" + search.trim().toLowerCase() + "%";

        return (root, query, cb) ->
                cb.or(

                        cb.like(
                                cb.lower(root.get("productName")),
                                value
                        ),

                        cb.like(
                                cb.lower(root.get("productCode")),
                                value
                        ),

                        cb.like(
                                cb.lower(root.get("sku")),
                                value
                        ),

                        cb.like(
                                cb.lower(root.get("brand")),
                                value
                        ),

                        cb.like(
                                cb.lower(root.get("hsnCode")),
                                value
                        )
                );
    }


    // =====================================================
    // STATUS
    // =====================================================

    public static Specification<ProductEntity> hasStatus(
            Status status
    ) {

        if (status == null) {
            return Specification.unrestricted();
        }

        return (root, query, cb) ->
                cb.equal(
                        root.get("status"),
                        status
                );
    }


    // =====================================================
    // ID
    // =====================================================

    public static Specification<ProductEntity> hasId(
            Long id
    ) {

        if (id == null) {
            return Specification.unrestricted();
        }

        return (root, query, cb) ->
                cb.equal(
                        root.get("id"),
                        id
                );
    }


    // =====================================================
    // ACTIVE
    // =====================================================

    public static Specification<ProductEntity> isActive() {

        return (root, query, cb) ->
                cb.isTrue(
                        root.get("active")
                );
    }
}