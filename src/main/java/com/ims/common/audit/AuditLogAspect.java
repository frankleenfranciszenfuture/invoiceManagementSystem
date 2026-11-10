package com.ims.common.audit;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;



import com.ims.dtos.audit.AuditLogCreateRequest;

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

    @Around("@annotation(com.ims.common.audit.Auditable)")
    public Object audit(ProceedingJoinPoint joinPoint)
            throws Throwable {

        MethodSignature signature =
                (MethodSignature) joinPoint.getSignature();

        Method method = AopUtils.getMostSpecificMethod(
                signature.getMethod(),
                joinPoint.getTarget().getClass()
        );

        Auditable auditable =
                AnnotatedElementUtils.findMergedAnnotation(
                        method,
                        Auditable.class
                );

        if (auditable == null) {
            return joinPoint.proceed();
        }

        AuditAction action = auditable.action();

        String entityName = auditable.entity();

        String entityId = resolveRecordId(
                auditable.recordId(),
                method,
                joinPoint.getArgs()
        );

        String oldValue = null;

        boolean captureOld =
                action == AuditAction.UPDATE
                        || action == AuditAction.DELETE
                        || action == AuditAction.STATUS_CHANGE;

        if (captureOld && entityId != null) {

            Object oldEntity = entityResolver.findEntity(
                    entityName,
                    entityId
            );

            oldValue = serializeSnapshot(
                    entityName,
                    oldEntity
            );
        }

        // Execute original business operation.
        Object result = joinPoint.proceed();

        // Extract generated ID from CREATE response.
        if (entityId == null) {
            entityId = extractId(result);
        }

        String newValue = null;

        if (action != AuditAction.DELETE
                && entityId != null) {

            Object newEntity = entityResolver.findEntity(
                    entityName,
                    entityId
            );

            newValue = serializeSnapshot(
                    entityName,
                    newEntity
            );
        }

        saveAudit(
                auditable,
                entityId,
                oldValue,
                newValue
        );

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

        JsonNode node = objectMapper.valueToTree(result);

        if (node.hasNonNull("id")) {
            return node.get("id").asText();
        }

        if (node.has("data")) {
            return extractId(node.get("data"));
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
}
