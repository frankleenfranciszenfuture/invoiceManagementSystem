package com.ims.utils.specification;


import com.ims.entity.EmailSignatureEntity;
import org.springframework.data.jpa.domain.Specification;

public final class EmailSignatureSpecification {

    private EmailSignatureSpecification() {
    }

    public static Specification<EmailSignatureEntity> belongsToUser(
            Long userId
    ) {
        return (root, query, cb) ->
                cb.equal(root.get("userId"), userId);
    }

    public static Specification<EmailSignatureEntity> hasStatus(
            String status
    ) {
        return (root, query, cb) ->
                status == null || status.isBlank()
                        ? cb.conjunction()
                        : cb.equal(
                        cb.upper(root.get("status")),
                        status.trim().toUpperCase()
                );
    }

    public static Specification<EmailSignatureEntity> nameContains(
            String search
    ) {
        return (root, query, cb) ->
                search == null || search.isBlank()
                        ? cb.conjunction()
                        : cb.like(
                        cb.lower(root.get("signatureName")),
                        "%" + search.trim().toLowerCase() + "%"
                );
    }

    public static Specification<EmailSignatureEntity> isDefaultForNew(
            Boolean value
    ) {
        return (root, query, cb) ->
                value == null
                        ? cb.conjunction()
                        : cb.equal(root.get("defaultForNewMessages"), value);
    }

    public static Specification<EmailSignatureEntity> isDefaultForReplies(
            Boolean value
    ) {
        return (root, query, cb) ->
                value == null
                        ? cb.conjunction()
                        : cb.equal(root.get("defaultForReplies"), value);
    }
}