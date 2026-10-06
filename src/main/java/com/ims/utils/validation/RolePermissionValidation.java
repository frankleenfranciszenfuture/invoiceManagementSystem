package com.ims.utils.validation;


import com.ims.entity.*;
import com.ims.exception.ValidationException;
import com.ims.repository.permission.RoleBasedPermissionRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;



@Component
@RequiredArgsConstructor
public class RolePermissionValidation {

    private final RoleBasedPermissionRepository rolePermissionRepository;

    // =====================================================
    // ROLE PERMISSION VALIDATION
    // =====================================================

    public void validate(Long roleId) {

        /*
         * Super Admin permissions cannot be modified.
         */
        if (roleId == 1) {
            throw new ValidationException(
                    "Super Admin permissions cannot be modified.");
        }
    }

    // =====================================================
    // DUPLICATE PERMISSION VALIDATION
    // =====================================================

    public void validateDuplicatePermission(
            RoleEntity role,
            ModuleActionEntity moduleAction) {

        boolean exists =
                rolePermissionRepository
                        .existsByRole_IdAndModule_IdAndAction_Id(
                                role.getId(),
                                moduleAction.getModule().getId(),
                                moduleAction.getAction().getId());

        if (exists) {
            throw new ValidationException(
                    "Permission already assigned.");
        }
    }
}