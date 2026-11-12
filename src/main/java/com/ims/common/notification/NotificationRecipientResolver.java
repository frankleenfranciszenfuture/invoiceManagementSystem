
package com.ims.common.notification;

import com.ims.entity.ModuleActionEntity;
import com.ims.enums.notification.NotificationModule;
import com.ims.repository.UserRepository;
import com.ims.repository.permission.ModuleActionRepository;
import com.ims.repository.permission.UserPermissionRepository;
import com.ims.service.serviceInterface.permission.invoiceApproval.InvoiceApprovalPermissionService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class NotificationRecipientResolver {

    private static final String VIEW_ACTION = "VIEW";

    private static final String INVOICE_PERMISSION_MODULE = "Invoices";
    private static final String APPROVE_ACTION = "APPROVE";

    private static final Set<String> ADMIN_ROLES = Set.of(
            "ADMIN",
            "SUPER_ADMIN"
    );

    private final InvoiceApprovalPermissionService invoiceApprovalPermissionService;

    private final ModuleActionRepository moduleActionRepository;

    private final UserPermissionRepository userPermissionRepository;

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Set<Long> resolveRecipients(NotificationSnapshot snapshot) {

        if (snapshot == null) {
            throw new IllegalArgumentException(
                    "Notification snapshot is required."
            );
        }

        // 1. Explicit recipients take priority.
        Set<Long> explicitRecipients = snapshot.getRecipientUserIds();

        if (explicitRecipients != null && !explicitRecipients.isEmpty()) {

            Set<Long> recipients = new LinkedHashSet<>(explicitRecipients);

            recipients.remove(null);
            recipients.removeIf(id -> id <= 0);

            if (recipients.isEmpty()) {
                throw new IllegalArgumentException(
                        "No valid notification recipients were provided."
                );
            }

            return recipients;
        }

        // 2. Validate notification module.
        NotificationModule notificationModule = snapshot.getModuleName();

        if (notificationModule == null) {
            throw new IllegalArgumentException(
                    "Notification module is required."
            );
        }

        String permissionModule =
                snapshot.getPermissionModule() != null
                        && !snapshot.getPermissionModule().isBlank()
                        ? snapshot.getPermissionModule()
                        : notificationModule.name();

        String permissionAction =
                snapshot.getPermissionAction() != null
                        && !snapshot.getPermissionAction().isBlank()
                        ? snapshot.getPermissionAction()
                        : VIEW_ACTION;

        Set<Long> recipients = new LinkedHashSet<>();

        // 3. Invoice approval uses the actual approval permission service.
        if (INVOICE_PERMISSION_MODULE.equalsIgnoreCase(permissionModule)
                && APPROVE_ACTION.equalsIgnoreCase(permissionAction)) {

            recipients.addAll(
                    invoiceApprovalPermissionService.findApproverUserIds()
            );

        } else {

            // 4. Generic permission-based recipient resolution.
            ModuleActionEntity moduleAction =
                    moduleActionRepository.findActiveModuleAction(
                            permissionModule,
                            permissionAction
                    ).orElseThrow(() -> new IllegalStateException(
                            permissionAction
                                    + " permission is not configured for module: "
                                    + permissionModule
                    ));

            recipients.addAll(
                    userPermissionRepository.findActiveUserIdsWithPermission(
                            moduleAction.getModule().getId(),
                            moduleAction.getAction().getId()
                    )
            );

            // Include active admins for generic permission notifications.
            Set<Long> adminRecipients =
                    userRepository.findActiveUserIdsByRoleNames(ADMIN_ROLES);

            if (adminRecipients != null) {
                recipients.addAll(adminRecipients);
            }
        }

        // 5. Remove invalid IDs.
        recipients.remove(null);
        recipients.removeIf(id -> id <= 0);

        if (recipients.isEmpty()) {
            throw new IllegalStateException(
                    "No active users are available to receive notifications "
                            + "for module: " + notificationModule.name()
            );
        }

        return recipients;
    }
}
