
package com.ims.common.notification;

import com.ims.common.ApiResponse;
import com.ims.service.serviceInterface.common.CurrentSessionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;

import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

import java.lang.reflect.Array;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Set;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationAspect {

    private final NotificationEventPublisher eventPublisher;

    private final CurrentSessionService currentSessionService;

    private final ExpressionParser parser = new SpelExpressionParser();

    @AfterReturning(
            pointcut = "@annotation(notify)",
            returning = "result",
            argNames = "joinPoint,notify,result"
    )
    public void handleNotification(
            JoinPoint joinPoint,
            Notify notify,
            Object result
    ) {

        log.info("========== NOTIFICATION ASPECT STARTED ==========");
        log.info("Method: {}", joinPoint.getSignature().getName());

        try {

            // Skip unsuccessful API responses.
            if (result instanceof ApiResponse<?> response
                    && !response.isSuccess()) {

                log.warn(
                        "Notification skipped: API response indicates failure."
                );
                return;
            }

            // Direct DTO responses are also supported.
            if (result == null) {
                log.warn("Notification skipped: method result is null.");
                return;
            }

            if (!currentSessionService.isUser()) {
                log.warn(
                        "Notification skipped: current session is not a user."
                );
                return;
            }

            Long senderId = currentSessionService.getUserId();

            if (senderId == null || senderId <= 0) {
                log.warn("Notification skipped: sender ID unavailable.");
                return;
            }

            StandardEvaluationContext context =
                    createEvaluationContext(joinPoint, result);

            Set<Long> recipients =
                    evaluateRecipients(
                            notify.recipientUserIds(),
                            context
                    );

            NotificationSnapshot snapshot =
                    NotificationSnapshot.builder()
                            .title(evaluate(notify.title(), context))
                            .message(evaluate(notify.message(), context))
                            .moduleName(notify.module())
                            .action(notify.action())
                            .entityName(notify.entityName())
                            .entityId(evaluate(notify.entityId(), context))
                            .actionUrl(evaluate(notify.actionUrl(), context))
                            .notificationType(notify.notificationType())
                            .priority(notify.priority())
                            .recipientUserIds(recipients)
                            .permissionModule(
                                    isBlank(notify.permissionModule())
                                            ? notify.module().name()
                                            : notify.permissionModule()
                            )
                            .permissionAction(notify.permissionAction())
                            .build();

            log.info("Notification title: {}", snapshot.getTitle());
            log.info("Notification message: {}", snapshot.getMessage());
            log.info("Notification module: {}", snapshot.getModuleName());
            log.info("Notification entity ID: {}", snapshot.getEntityId());
            log.info("Notification sender ID: {}", senderId);
            log.info("Explicit recipients: {}", recipients);
            log.info(
                    "Permission lookup: {} / {}",
                    snapshot.getPermissionModule(),
                    snapshot.getPermissionAction()
            );

            eventPublisher.publish(snapshot, senderId);

            log.info("Notification application event published.");

        } catch (Exception exception) {

            log.error(
                    "Failed to publish notification for method: {}",
                    joinPoint.getSignature().getName(),
                    exception
            );
        }
    }

    private StandardEvaluationContext createEvaluationContext(
            JoinPoint joinPoint,
            Object result
    ) {

        StandardEvaluationContext context =
                new StandardEvaluationContext();

        context.setVariable("result", result);

        Object[] arguments = joinPoint.getArgs();

        MethodSignature signature =
                (MethodSignature) joinPoint.getSignature();

        String[] parameterNames = signature.getParameterNames();

        for (int i = 0; i < arguments.length; i++) {

            context.setVariable("p" + i, arguments[i]);
            context.setVariable("a" + i, arguments[i]);

            if (parameterNames != null && i < parameterNames.length) {
                context.setVariable(parameterNames[i], arguments[i]);
            }
        }

        return context;
    }

    private Set<Long> evaluateRecipients(
            String expression,
            StandardEvaluationContext context
    ) {

        Set<Long> recipients = new LinkedHashSet<>();

        if (isBlank(expression)) {
            return recipients;
        }

        Object value = parser.parseExpression(expression)
                .getValue(context);

        if (value == null) {
            return recipients;
        }

        if (value instanceof Number number) {
            recipients.add(number.longValue());
            return recipients;
        }

        if (value instanceof Collection<?> collection) {
            collection.forEach(item -> addRecipient(recipients, item));
            return recipients;
        }

        if (value instanceof Iterable<?> iterable) {
            iterable.forEach(item -> addRecipient(recipients, item));
            return recipients;
        }

        if (value.getClass().isArray()) {
            for (int i = 0; i < Array.getLength(value); i++) {
                addRecipient(recipients, Array.get(value, i));
            }
            return recipients;
        }

        addRecipient(recipients, value);

        return recipients;
    }

    private void addRecipient(
            Set<Long> recipients,
            Object value
    ) {

        if (value == null) {
            return;
        }

        if (value instanceof Number number) {
            recipients.add(number.longValue());
            return;
        }

        if (value instanceof String string && !string.isBlank()) {
            recipients.add(Long.parseLong(string.trim()));
        }
    }

    private String evaluate(
            String expression,
            StandardEvaluationContext context
    ) {

        if (isBlank(expression)) {
            return null;
        }

        // Plain annotation values are literal strings, not SpEL.
        if (!expression.contains("#")) {
            return expression;
        }

        Object value = parser.parseExpression(expression)
                .getValue(context);

        return value == null ? null : value.toString();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
