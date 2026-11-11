
package com.ims.common.audit;

import com.ims.entity.CompanyDetails;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.metamodel.EntityType;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class DefaultAuditEntityResolver
        implements AuditEntityResolver {

    @PersistenceContext
    private EntityManager entityManager;

    private final Map<String, Class<?>> entityAliases =
            new HashMap<>();

    public DefaultAuditEntityResolver() {

        // Company aliases
        registerAlias("COMPANY", CompanyDetails.class);
        registerAlias("COMPANY_DETAILS", CompanyDetails.class);
    }

    private void registerAlias(
            String alias,
            Class<?> entityClass
    ) {
        entityAliases.put(normalize(alias), entityClass);
    }

    @Override
    public Object findEntity(
            String entityName,
            String entityId
    ) {

        if (entityName == null || entityId == null) {
            return null;
        }

        String normalizedName = normalize(entityName);

        // 1. Check explicit aliases first.
        Class<?> aliasedClass = entityAliases.get(normalizedName);

        if (aliasedClass != null) {
            return findByClass(aliasedClass, entityName, entityId);
        }

        // 2. Otherwise resolve dynamically through JPA metamodel.
        for (EntityType<?> entityType :
                entityManager.getMetamodel().getEntities()) {

            Class<?> javaType = entityType.getJavaType();

            String jpaName = entityType.getName();

            String className = javaType.getSimpleName();

            if (!matches(entityName, jpaName)
                    && !matches(entityName, className)) {
                continue;
            }

            return findByClass(
                    javaType,
                    entityName,
                    entityId
            );
        }

        throw new IllegalArgumentException(
                "No JPA entity registered for: " + entityName
        );
    }

    private Object findByClass(
            Class<?> entityClass,
            String entityName,
            String entityId
    ) {

        EntityType<?> entityType =
                entityManager.getMetamodel().entity(entityClass);

        Object id = convertId(
                entityId,
                entityType.getIdType().getJavaType()
        );

        Object entity = entityManager.find(entityClass, id);

        if (entity == null) {
            throw new EntityNotFoundException(
                    entityName + " not found: " + entityId
            );
        }

        return entity;
    }

    private boolean matches(
            String requested,
            String actual
    ) {

        return normalize(requested).equals(normalize(actual));
    }

    private String normalize(String value) {

        return value
                .replaceAll("(?i)Entity$", "")
                .replaceAll("[^a-zA-Z0-9]", "")
                .toUpperCase();
    }

    private Object convertId(
            String value,
            Class<?> idType
    ) {

        if (idType == Long.class || idType == long.class) {
            return Long.valueOf(value);
        }

        if (idType == Integer.class || idType == int.class) {
            return Integer.valueOf(value);
        }

        if (idType == String.class) {
            return value;
        }

        if (idType == java.util.UUID.class) {
            return java.util.UUID.fromString(value);
        }

        throw new IllegalArgumentException(
                "Unsupported entity ID type: " + idType.getName()
        );
    }
}
