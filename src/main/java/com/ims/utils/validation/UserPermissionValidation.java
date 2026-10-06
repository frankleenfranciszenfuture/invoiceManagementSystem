package com.ims.utils.validation;

import com.ims.entity.ModuleActionEntity;
import com.ims.entity.UserBasedPermission;
import com.ims.entity.UserEntity;
import com.ims.exception.ValidationException;

import com.ims.repository.permission.UserPermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserPermissionValidation {

    private final UserPermissionRepository userPermissionRepository;

    // =========================================================
    // VALIDATE USER PERMISSION ACCESS
    // =========================================================

    public void validate(Long userId) {

        /*
         * Super Admin permissions cannot be modified.
         */
        if (userId == 1) {

            throw new ValidationException(
                    "Super Admin permissions cannot be modified."
            );
        }
    }

    // =========================================================
    // DUPLICATE USER PERMISSION
    // =========================================================

    public void validateDuplicatePermission(
            UserEntity user,
            ModuleActionEntity moduleAction) {

        boolean exists =
                userPermissionRepository
                        .existsByUserAndModuleAndAction(
                                user,
                                moduleAction.getModule(),
                                moduleAction.getAction()
                        );

        if (exists) {

            throw new ValidationException(
                    "Permission already assigned."
            );
        }
    }

    // =========================================================
    // VALIDATE UPDATE
    // =========================================================

    public void validateUpdate(
            UserBasedPermission existing,
            Boolean allowed) {

        if (existing == null) {

            throw new ValidationException(
                    "User permission not found."
            );
        }

        if (allowed == null) {

            throw new ValidationException(
                    "Allowed is required."
            );
        }
    }

    // =========================================================
    // VALIDATE REQUEST SIZE
    // =========================================================

    public void validateRequestSize(int size) {

        if (size <= 0) {

            throw new ValidationException(
                    "Permission list cannot be empty."
            );
        }
    }
}