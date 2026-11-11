package com.ims.common.audit;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;


import com.ims.common.ApiResponse;
import com.ims.dtos.audit.AuditLogCreateRequest;

import com.ims.dtos.inventory.InventoryStockResponse;
import com.ims.enums.audit.AuditAction;

import com.ims.service.impl.common.CurrentUserService;
import com.ims.service.serviceInterface.audit.AuditLogService;
import com.ims.service.serviceInterface.common.CurrentSessionService;

import jakarta.servlet.http.HttpServletRequest;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;

import org.springframework.aop.support.AopUtils;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.List;

import com.ims.entity.UserEntity;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditLogAspect {

    private final AuditLogService auditLogService;

    private final AuditEntityResolver entityResolver;

    private final List<AuditSnapshotMapper> snapshotMappers;

    private final CurrentSessionService currentSessionService;

    private final ObjectMapper objectMapper;

    private final CurrentUserService currentUserService;

    private final SpelExpressionParser parser =
            new SpelExpressionParser();


    @Around("execution(public * com.ims.service..*(..))")
    public Object audit(ProceedingJoinPoint joinPoint) throws Throwable {

        MethodSignature signature =
                (MethodSignature) joinPoint.getSignature();

        Method implementationMethod = AopUtils.getMostSpecificMethod(
                signature.getMethod(),
                joinPoint.getTarget().getClass()
        );

        Auditable auditable = AnnotatedElementUtils.findMergedAnnotation(
                implementationMethod,
                Auditable.class
        );


        // Also check the interface method if the implementation has no annotation.
        if (auditable == null) {
            log.info(
                    "AUDIT SKIPPED | Method: {} | Implementation: {}",
                    signature.getMethod().getName(),
                    implementationMethod.getName()
            );

            auditable = AnnotatedElementUtils.findMergedAnnotation(
                    signature.getMethod(),
                    Auditable.class
            );
        }

        if (auditable == null) {
            return joinPoint.proceed();
        }

        AuditAction action = auditable.action();
        String entityName = auditable.entity();

        log.info(
                "AUDIT INTERCEPTED | Method: {} | Entity: {} | Action: {}",
                implementationMethod.getName(),
                entityName,
                action
        );

        String entityId = resolveRecordId(
                auditable.recordId(),
                implementationMethod,
                joinPoint.getArgs()
        );

        String oldValue = null;

        boolean captureOld =
                action == AuditAction.UPDATE
                        || action == AuditAction.DELETE
                        || action == AuditAction.STATUS_CHANGE
                        || action == AuditAction.SENT
                        || action == AuditAction.CANCEL
                        || action == AuditAction.APPROVE
                        || action == AuditAction.REJECT;

        if (captureOld && entityId != null) {

            log.info(
                    "AUDIT OLD SNAPSHOT START | Entity: {} | ID: {} | Action: {}",
                    entityName,
                    entityId,
                    action
            );

            Object oldEntity = entityResolver.findEntity(
                    entityName,
                    entityId
            );

            log.info(
                    "AUDIT OLD ENTITY FOUND: {}",
                    oldEntity != null
            );

            oldValue = serializeSnapshot(entityName, oldEntity);

            log.info(
                    "AUDIT OLD SNAPSHOT COMPLETED | Entity: {} | ID: {}",
                    entityName,
                    entityId
            );
        }

        Object result = joinPoint.proceed();

        if (entityId == null) {
            entityId = extractId(result);
        }

        String newValue = null;

        if (action != AuditAction.DELETE) {

            Object newEntity = entityId != null
                    ? entityResolver.findEntity(entityName, entityId)
                    : null;

            if (newEntity != null) {
                newValue = serializeSnapshot(entityName, newEntity);

            } else if (result != null) {
                newValue = objectMapper.writeValueAsString(
                        unwrapResponse(result)
                );
            }
        }

        log.info(
                "AUDIT BEFORE SAVE | Entity: {} | ID: {} | Action: {}",
                entityName,
                entityId,
                action
        );

        saveAudit(
                auditable,
                entityId,
                oldValue,
                newValue
        );

        return result;
    }

    private Object unwrapResponse(Object result) {

        if (result instanceof ApiResponse<?> response) {
            return unwrapResponse(response.getData());
        }

        return result;
    }

    private String resolveRecordId(
            String expression,
            Method method,
            Object[] args) {

        if (expression == null || expression.isBlank()) {
            return null;
        }

        StandardEvaluationContext context =
                new StandardEvaluationContext();

        Parameter[] parameters = method.getParameters();

        for (int i = 0; i < parameters.length; i++) {

            context.setVariable("p" + i, args[i]);
            context.setVariable("a" + i, args[i]);

            if (parameters[i].isNamePresent()) {
                context.setVariable(
                        parameters[i].getName(),
                        args[i]
                );
            }
        }

        Object value = parser
                .parseExpression(expression)
                .getValue(context);

        return value == null ? null : value.toString();
    }

    private String extractId(Object result) {

        if (result == null) {
            return null;
        }

        // Unwrap ApiResponse<T>
        if (result instanceof ApiResponse<?> response) {
            return extractId(response.getData());
        }

        try {
            Method getIdMethod = result.getClass().getMethod("getId");

            Object id = getIdMethod.invoke(result);

            return id != null ? id.toString() : null;

        } catch (NoSuchMethodException exception) {

            log.debug(
                    "No getId() method found on audit response: {}",
                    result.getClass().getSimpleName()
            );

        } catch (Exception exception) {

            log.warn(
                    "Unable to extract audit entity ID from {}: {}",
                    result.getClass().getSimpleName(),
                    exception.getMessage()
            );
        }

        return null;
    }


    private String serializeSnapshot(
            String entityName,
            Object entity) throws Exception {

        if (entity == null) {
            return null;
        }

        List<AuditSnapshotMapper> matchingMappers =
                snapshotMappers.stream()
                        .filter(mapper ->
                                mapper.supports(entityName)
                        )
                        .toList();

        AuditSnapshotMapper mapper;

        if (matchingMappers.size() > 1) {

            throw new IllegalStateException(
                    "Multiple audit snapshot mappers found for entity: "
                            + entityName
            );

        } else if (matchingMappers.size() == 1) {

            mapper = matchingMappers.get(0);

        } else {

            mapper = snapshotMappers.stream()
                    .filter(DefaultAuditSnapshotMapper.class::isInstance)
                    .findFirst()
                    .orElseThrow(() ->
                            new IllegalStateException(
                                    "No audit snapshot mapper or default mapper found for: "
                                            + entityName
                            )
                    );
        }

        Object snapshot = mapper.toSnapshot(entity);

        log.info(
                "Audit snapshot mapper selected: {} for entity: {}",
                mapper.getClass().getSimpleName(),
                entityName
        );

        return objectMapper.writeValueAsString(snapshot);
    }


    private void saveAudit(
            Auditable auditable,
            String entityId,
            String oldValue,
            String newValue) {

        Long userId = currentSessionService.getUserId();

        boolean employee = currentSessionService.isEmployee();

        String userType = employee ? "EMPLOYEE" : "ADMIN";

        String performedByName = getPerformedByName(employee);

        AuditLogCreateRequest request =
                AuditLogCreateRequest.builder()
                        .entityName(auditable.entity())
                        .entityId(entityId)
                        .action(auditable.action())
                        .description(auditable.description())
                        .oldValue(oldValue)
                        .newValue(newValue)
                        .performedBy(userId)
                        .performedByName(performedByName)
                        .performedByType(userType)
                        .ipAddress(getIpAddress())
                        .moduleName(auditable.entity())
                        .build();

        auditLogService.createAuditLog(request);
    }

    private String getPerformedByName(boolean employee) {

        try {

            if (employee) {
                // Employee name can be populated using your employee session.
                return null;
            }

            UserEntity currentUser =
                    currentUserService.getCurrentUser();

            return currentUser != null
                    ? currentUser.getName()
                    : null;

        } catch (Exception exception) {

            log.warn(
                    "Unable to resolve audit performed-by name: {}",
                    exception.getMessage()
            );

            return null;
        }
    }

    private String getIpAddress() {

        ServletRequestAttributes attributes =
                (ServletRequestAttributes)
                        RequestContextHolder.getRequestAttributes();

        if (attributes == null) {
            return null;
        }

        HttpServletRequest request =
                attributes.getRequest();

        return request.getRemoteAddr();
    }

    private String resolveEntityId(
            String entityName,
            String expression,
            Method method,
            Object[] args
    ) {

        String entityId = resolveRecordId(
                expression,
                method,
                args
        );

        if (entityId != null) {
            return entityId;
        }

        // Resolve inventory stock using its composite key.
        if ("INVENTORY_STOCK".equalsIgnoreCase(entityName)) {
            // Resolve using productId, warehouseId, unitId and sizeId.
            // Return the existing InventoryStockEntity ID.
        }

        return null;
    }
}
