package com.ims.service.impl.permission;



import com.ims.dtos.permission.rolePermission.*;
import com.ims.entity.ModuleActionEntity;
import com.ims.entity.RoleBasedPermission;
import com.ims.entity.RoleEntity;
import com.ims.exception.ValidationException;
import com.ims.mapper.permission.RolePermissionMapper;
import com.ims.repository.RoleRepository;
import com.ims.repository.permission.RoleBasedPermissionRepository;
import com.ims.service.serviceInterface.access.AccessService;
import com.ims.service.serviceInterface.permission.RolePermissionService;
import com.ims.utils.validation.RolePermissionValidation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RolePermissionServiceImpl implements RolePermissionService {

    private final AccessService accessService;
    private final RolePermissionMapper mapper;

    private final RoleBasedPermissionRepository rolePermissionRepository;
    private final RolePermissionValidation validation;
    private final RoleRepository roleRepository;


    /* =========================================================
       GET PERMISSIONS BY ROLE
       ========================================================= */

    @Override
    @Transactional(readOnly = true)
    public List<RolePermissionResponse> getPermissionsByRole(
            Long roleId) {

        RoleEntity role =
                roleRepository.findById(roleId)
                        .orElseThrow(() ->
                                new ValidationException(
                                        "Role not found with id: " + roleId));

        List<RoleBasedPermission> permissions =
                rolePermissionRepository.findByRoleId(role.getId());

        return mapper.toDTO(permissions);
    }


    /* =========================================================
       ASSIGN PERMISSIONS
       ========================================================= */

    @Override
    @Transactional
    public List<RolePermissionResponse> assignPermissions(
            Long roleId,
            AssignRolePermissionRequest request) {

        RoleEntity role =
                roleRepository.findById(roleId)
                        .orElseThrow(() ->
                                new ValidationException(
                                        "Role not found with id: " + roleId));

//        validateRolePermissionAssignment(role);

        List<RoleBasedPermission> permissions =
                new ArrayList<>();

        for (RolePermissionRequest dto :
                request.getPermissions()) {

            ModuleActionEntity moduleAction =
                    accessService.findModuleAction(
                            dto.getModuleActionId());

            validation.validateDuplicatePermission(
                    role,
                    moduleAction);

            RoleBasedPermission permission =
                    RoleBasedPermission.builder()
                            .role(role)
                            .module(moduleAction.getModule())
                            .action(moduleAction.getAction())
                            .allowed(dto.getAllowed())
                            .build();

            permissions.add(permission);
        }

        permissions =
                rolePermissionRepository.saveAll(permissions);

        return mapper.toDTO(permissions);
    }


    /* =========================================================
       BULK ASSIGN PERMISSIONS TO ROLES
       ========================================================= */

    @Override
    @Transactional
    public List<RolePermissionResponse> assignPermissionsToRoles(
            BulkRolePermissionRequest request) {

        List<RoleBasedPermission> permissions =
                new ArrayList<>();

        for (RolePermissionRoleRequest roleRequest :
                request.getRoles()) {

            Long roleId = roleRequest.getRoleId();

            RoleEntity role =
                    roleRepository.findById(roleId)
                            .orElseThrow(() ->
                                    new ValidationException(
                                            "Role not found with id: "
                                                    + roleId));

//            validateRolePermissionAssignment(role);

            for (RolePermissionRequest permissionRequest :
                    roleRequest.getPermissions()) {

                ModuleActionEntity moduleAction =
                        accessService.findModuleAction(
                                permissionRequest.getModuleActionId());

                validation.validateDuplicatePermission(
                        role,
                        moduleAction);

                RoleBasedPermission permission =
                        RoleBasedPermission.builder()
                                .role(role)
                                .module(moduleAction.getModule())
                                .action(moduleAction.getAction())
                                .allowed(permissionRequest.getAllowed())
                                .build();

                permissions.add(permission);
            }
        }

        permissions =
                rolePermissionRepository.saveAll(permissions);

        return mapper.toDTO(permissions);
    }


    /* =========================================================
       UPDATE PERMISSIONS
       ========================================================= */

    @Override
    @Transactional
    public List<RolePermissionResponse> updatePermissions(
            Long roleId,
            AssignRolePermissionRequest request) {

        RoleEntity role =
                roleRepository.findById(roleId)
                        .orElseThrow(() ->
                                new ValidationException(
                                        "Role not found with id: " + roleId));

//        validateRolePermissionAssignment(role);

        List<RoleBasedPermission> permissions =
                new ArrayList<>();

        for (RolePermissionRequest dto :
                request.getPermissions()) {

            ModuleActionEntity moduleAction =
                    accessService.findModuleAction(
                            dto.getModuleActionId());

            RoleBasedPermission permission =
                    rolePermissionRepository
                            .findByRole_IdAndModule_IdAndAction_Id(
                                    role.getId(),
                                    moduleAction.getModule().getId(),
                                    moduleAction.getAction().getId())
                            .orElse(
                                    RoleBasedPermission.builder()
                                            .role(role)
                                            .module(moduleAction.getModule())
                                            .action(moduleAction.getAction())
                                            .build()
                            );

            permission.setAllowed(dto.getAllowed());

            permissions.add(permission);
        }

        permissions =
                rolePermissionRepository.saveAll(permissions);

        return mapper.toDTO(permissions);
    }


    /* =========================================================
       BULK UPDATE PERMISSIONS
       ========================================================= */

    @Override
    @Transactional
    public List<RolePermissionResponse> updatePermissionsToRoles(
            BulkRolePermissionRequest request) {

        List<RoleBasedPermission> permissions =
                new ArrayList<>();

        for (RolePermissionRoleRequest roleRequest :
                request.getRoles()) {

            Long roleId = roleRequest.getRoleId();

            RoleEntity role =
                    roleRepository.findById(roleId)
                            .orElseThrow(() ->
                                    new ValidationException(
                                            "Role not found with id: "
                                                    + roleId));

//            validateRolePermissionAssignment(role);

            for (RolePermissionRequest dto :
                    roleRequest.getPermissions()) {

                ModuleActionEntity moduleAction =
                        accessService.findModuleAction(
                                dto.getModuleActionId());

                RoleBasedPermission permission =
                        rolePermissionRepository
                                .findByRole_IdAndModule_IdAndAction_Id(
                                        role.getId(),
                                        moduleAction.getModule().getId(),
                                        moduleAction.getAction().getId())
                                .orElse(
                                        RoleBasedPermission.builder()
                                                .role(role)
                                                .module(moduleAction.getModule())
                                                .action(moduleAction.getAction())
                                                .build()
                                );

                permission.setAllowed(dto.getAllowed());

                permissions.add(permission);
            }
        }

        permissions =
                rolePermissionRepository.saveAll(permissions);

        return mapper.toDTO(permissions);
    }


    /* =========================================================
       GET ALL
       ========================================================= */

    @Override
    @Transactional(readOnly = true)
    public List<RolePermissionResponse> getAll() {

        return rolePermissionRepository
                .findAllWithRoleModuleAction()
                .stream()
                .map(mapper::toDTO)
                .toList();
    }


    /* =========================================================
       GET BY ID
       ========================================================= */

    @Override
    @Transactional(readOnly = true)
    public RolePermissionResponse getById(
            Long id) {

        RoleBasedPermission permission =
                rolePermissionRepository
                        .findByIdWithRelations(id)
                        .orElseThrow(() ->
                                new ValidationException(
                                        "Role permission not found with id: "
                                                + id));

        return mapper.toDTO(permission);
    }


    /* =========================================================
       DELETE
       ========================================================= */

    @Override
    @Transactional
    public void deleteById(Long id) {

        RoleBasedPermission permission =
                rolePermissionRepository
                        .findByIdWithRelations(id)
                        .orElseThrow(() ->
                                new ValidationException(
                                        "Role permission not found with id: "
                                                + id));

        if (permission.getRole().getId() == 1) {
            throw new ValidationException(
                    "Super admin access cannot be deleted");
        }

        rolePermissionRepository.delete(permission);
    }


    /* =========================================================
       ROLE VALIDATION
       ========================================================= */

    private void validateRolePermissionAssignment(
            RoleEntity role) {

        String roleName =
                role.getRoleName();

        if (!"SUPER_ADMIN".equalsIgnoreCase(roleName)
                && !"BRANCH_ADMIN".equalsIgnoreCase(roleName)
               ) {

            throw new ValidationException(
                    "POS login is disabled for role: "
                            + roleName);
        }
    }
}