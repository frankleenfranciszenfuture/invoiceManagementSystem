package com.ims.utils.validation;


import com.ims.entity.*;
import com.ims.exception.ValidationException;
import com.ims.repository.permission.RoleBasedPermissionRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RolePermissionValidation {

    private final RoleBasedPermissionRepository repository;


    public void validateCreate(
            RoleEntity role,
            ModuleEntity module,
            ActionEntity action
    ) {

        if (repository.existsByRoleAndModuleAndAction(
                role,
                module,
                action
        )) {

            throw new ValidationException(
                    "Permission already exists for this role."
            );
        }
    }
}
