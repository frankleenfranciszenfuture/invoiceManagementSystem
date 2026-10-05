package com.ims.utils.validation;

import com.ims.entity.ActionEntity;
import com.ims.entity.ModuleEntity;
import com.ims.entity.UserEntity;
import com.ims.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserPermissionValidation {

    /**
     * Validate the basic user permission relationship.
     *
     * IMPORTANT:
     *
     * Duplicate checking is intentionally NOT done here.
     *
     * Duplicate handling belongs to UserPermissionServiceImpl
     * because the service needs to distinguish:
     *
     * 1. New permission
     * 2. Existing active permission
     * 3. Existing inactive permission
     *
     * User permission uniqueness:
     *
     * USER + MODULE + ACTION
     *
     * Role is NOT part of user permission uniqueness.
     */
    public void validateCreate(
            UserEntity user,
            ModuleEntity module,
            ActionEntity action
    ) {

        if (user == null) {
            throw new ValidationException(
                    "User is required."
            );
        }

        if (module == null) {
            throw new ValidationException(
                    "Module is required."
            );
        }

        if (action == null) {
            throw new ValidationException(
                    "Action is required."
            );
        }
    }
}