package com.ims.common.audit;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.metamodel.EntityType;

import org.springframework.stereotype.Component;

@Component
public class DefaultAuditEntityResolver
        implements AuditEntityResolver {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Object findEntity(
            String entityName,
            String entityId) {

        if (entityName == null || entityId == null) {
            return null;
        }

        for (EntityType<?> entityType :
                entityManager.getMetamodel().getEntities()) {

            Class<?> javaType = entityType.getJavaType();

            String jpaName = entityType.getName();

            String className = javaType.getSimpleName();

            if (!matches(entityName, jpaName)
                    && !matches(entityName, className)) {
                continue;
            }

            Object id = convertId(
                    entityId,
                    entityType.getIdType().getJavaType()
            );

            Object entity = entityManager.find(javaType, id);

            if (entity == null) {
                throw new EntityNotFoundException(
                        entityName + " not found: " + entityId
                );
            }

            return entity;
        }

        throw new IllegalArgumentException(
                "No JPA entity registered for: " + entityName
        );
    }

    private boolean matches(
            String requested,
            String actual) {

        String first = normalize(requested);
        String second = normalize(actual);

        return first.equals(second);
    }

    private String normalize(String value) {

        return value
                .replaceAll("(?i)Entity$", "")
                .replaceAll("[^a-zA-Z0-9]", "")
                .toUpperCase();
    }

    private Object convertId(
            String value,
            Class<?> idType) {

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

