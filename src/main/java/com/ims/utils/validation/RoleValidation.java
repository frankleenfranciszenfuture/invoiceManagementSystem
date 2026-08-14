package com.ims.utils.validation;


import com.ims.entity.RoleEntity;
import com.ims.exception.ValidationException;
import com.ims.repository.RoleRepository;
import com.ims.service.impl.common.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoleValidation {

    private final RoleRepository roleRepository;
    private final CurrentUserService currentUserService;

    public void validateCreate(RoleEntity entity) {


        validateRoleName(entity.getRoleName());

        String roleName = entity.getRoleName().toUpperCase();


        if (!currentUserService.isSuperAdmin()
                && ("SUPER_ADMIN".equals(roleName)
                || "BRANCH_ADMIN".equals(roleName))) {

            throw new ValidationException(
                    "You cannot create system roles.");
        }
        if (currentUserService.isSuperAdmin()) {

            if (roleRepository.existsByRoleNameIgnoreCase(roleName)) {
                throw new ValidationException("role already exists.");
            }

            return;
        }

        if (roleRepository.existsByRoleNameIgnoreCase(
                roleName)) {

            throw new ValidationException(
                    "role already exists");
        }
    }


    public void validateUpdate(Long id, RoleEntity entity) {

        validateRoleName(entity.getRoleName());

        String roleName = entity.getRoleName().toUpperCase();


        if (!currentUserService.isSuperAdmin()
                && ("SUPER_ADMIN".equals(roleName))) {

            throw new ValidationException(
                    "You cannot create system roles.");
        }

        if (currentUserService.isSuperAdmin()) {

            if (roleRepository.existsByRoleNameIgnoreCaseAndIdNot(
                    roleName,
                    id)) {

                throw new ValidationException("role already exists.");
            }

            return;
        }

        if (roleRepository.existsByRoleNameIgnoreCaseAndIdNot(
                roleName,
                id)) {

            throw new ValidationException(
                    "role already exists.");
        }
    }


    private void validateRoleName(String roleName) {

        if (roleName == null || roleName.trim().isEmpty()) {
            throw new ValidationException("role name is required.");
        }

        if (roleName.length() < 3) {
            throw new ValidationException("role name must be at least 3 characters.");
        }

        if (!roleName.matches("^[A-Za-z_]+$")) {
            throw new ValidationException(
                    "role name can contain only letters and underscores. Spaces are not allowed.");
        }
    }
}