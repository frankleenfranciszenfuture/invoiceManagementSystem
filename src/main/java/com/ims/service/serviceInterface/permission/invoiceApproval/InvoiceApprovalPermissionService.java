package com.ims.service.serviceInterface.permission.invoiceApproval;


import com.ims.entity.*;
import com.ims.enums.Status;
import com.ims.repository.UserRepository;
import com.ims.repository.permission.ModuleActionRepository;
import com.ims.repository.permission.RoleBasedPermissionRepository;
import com.ims.repository.permission.UserPermissionRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InvoiceApprovalPermissionService {

    private static final String MODULE_NAME = "Invoices";
    private static final String ACTION_NAME = "APPROVE";

    private final ModuleActionRepository moduleActionRepository;
    private final UserPermissionRepository userPermissionRepository;
    private final RoleBasedPermissionRepository roleBasedPermissionRepository;
    private final UserRepository userRepository;

    public boolean hasApprovePermission(UserEntity user) {

        if (user == null || !Boolean.TRUE.equals(user.getActive())) {
            return false;
        }

        if (isAdmin(user)) {
            return true;
        }

        if (user.getRole() == null
                || !Boolean.TRUE.equals(user.getRole().getActive())) {
            return false;
        }

        ModuleActionEntity moduleAction = findInvoiceApproveModuleAction();

        if (moduleAction == null) {
            return false;
        }

        Long userId = user.getId();
        Long roleId = user.getRole().getId();
        Long moduleId = moduleAction.getModule().getId();
        Long actionId = moduleAction.getAction().getId();

        Optional<UserBasedPermission> userPermission =
                userPermissionRepository.findByUserIdAndModuleIdAndActionId(
                        userId,
                        moduleId,
                        actionId
                );

        if (userPermission.isPresent()
                && isActivePermission(userPermission.get())) {
            return userPermission.get().isAllowed();
        }

        Optional<RoleBasedPermission> rolePermission =
                roleBasedPermissionRepository.findByRoleIdAndModuleIdAndActionId(
                        roleId,
                        moduleId,
                        actionId
                );

        return rolePermission
                .filter(this::isActivePermission)
                .map(RoleBasedPermission::isAllowed)
                .orElse(false);
    }

    public List<UserEntity> findApprovers() {

        return userRepository.findAll()
                .stream()
                .filter(user -> Boolean.TRUE.equals(user.getActive()))
                .filter(this::hasApprovePermission)
                .toList();
    }

    private ModuleActionEntity findInvoiceApproveModuleAction() {

        return moduleActionRepository
                .findAllByOrderByModuleIdAscActionIdAsc()
                .stream()
                .filter(item ->
                        item.getModule() != null
                                && item.getAction() != null
                )
                .filter(item ->
                        MODULE_NAME.equalsIgnoreCase(
                                item.getModule().getModuleName()
                        )
                )
                .filter(item ->
                        ACTION_NAME.equalsIgnoreCase(
                                item.getAction().getActionName()
                        )
                )
                .filter(item ->
                        item.getModule() != null
                                && item.getModule().getStatus() == Status.ACTIVE
                )
                .filter(item ->
                        item.getAction() != null
                                && item.getAction().getStatus() == Status.ACTIVE
                )
                .findFirst()
                .orElse(null);
    }

    private boolean isActivePermission(UserBasedPermission perm) {
        return perm != null
                && Boolean.TRUE.equals(perm.getActive());
    }

    private boolean isActivePermission(RoleBasedPermission perm) {
        return perm != null
                && Boolean.TRUE.equals(perm.getActive());
    }

    private boolean isAdmin(UserEntity user) {

        String roleName = user.getRole() != null
                ? user.getRole().getRoleName()
                : null;

        return "ADMIN".equalsIgnoreCase(roleName)
                || "SUPER_ADMIN".equalsIgnoreCase(roleName);
    }
}