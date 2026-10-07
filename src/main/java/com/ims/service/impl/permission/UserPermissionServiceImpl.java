package com.ims.service.impl.permission;

import com.ims.dtos.permission.userPermission.*;
import com.ims.entity.ModuleActionEntity;
import com.ims.entity.RoleBasedPermission;
import com.ims.entity.UserBasedPermission;
import com.ims.entity.UserEntity;
import com.ims.exception.ResourceNotFoundException;
import com.ims.exception.ValidationException;
import com.ims.mapper.permission.UserPermissionMapper;
import com.ims.repository.permission.ModuleActionRepository;
import com.ims.repository.permission.RoleBasedPermissionRepository;
import com.ims.repository.permission.UserPermissionRepository;
import com.ims.service.impl.common.CurrentUserService;
import com.ims.service.serviceInterface.access.AccessService;
import com.ims.service.serviceInterface.permission.UserPermissionService;
import com.ims.utils.validation.UserPermissionValidation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserPermissionServiceImpl
        implements UserPermissionService {

    private final UserPermissionRepository userPermissionRepository;
    private final UserPermissionMapper mapper;
    private final AccessService accessService;
    private final UserPermissionValidation validation;
    private final CurrentUserService currentUserService;
    private final ModuleActionRepository moduleActionRepository;
    private final RoleBasedPermissionRepository roleBasedPermissionRepository;


    // =========================================================
    // ASSIGN USER PERMISSIONS
    // =========================================================

    @Override
    @Transactional
    public List<UserPermissionResponse> assignPermissions(
            Long userId,
            AssignUserPermissionRequest request) {

        validation.validate(userId);

        validation.validateRequestSize(
                request.getPermissions().size()
        );

        UserEntity user =
                accessService.findAccessibleUserAccess(userId);

        List<UserBasedPermission> permissions =
                new ArrayList<>();

        for (UserPermissionRequest dto
                : request.getPermissions()) {

            ModuleActionEntity moduleAction =
                    accessService.findModuleAction(
                            dto.getModuleActionId()
                    );

            UserBasedPermission permission =
                    userPermissionRepository
                            .findByUserAndModuleAndAction(
                                    user,
                                    moduleAction.getModule(),
                                    moduleAction.getAction()
                            )
                            .orElseGet(() ->
                                    UserBasedPermission.builder()
                                            .user(user)
                                            .role(user.getRole())
                                            .module(moduleAction.getModule())
                                            .action(moduleAction.getAction())
                                            .build()
                            );

            permission.setAllowed(dto.getAllowed());

            permissions.add(permission);
        }

        permissions =
                userPermissionRepository.saveAll(
                        permissions
                );

        return mapper.toDTO(permissions);
    }


    // =========================================================
    // BULK ASSIGN USER PERMISSIONS
    // =========================================================

    @Override
    @Transactional
    public List<UserPermissionResponse> bulkAssignPermissions(
            BulkAssignUserPermissionRequest request) {

        validation.validateRequestSize(
                request.getUsers().size()
        );

        List<UserBasedPermission> permissions =
                new ArrayList<>();

        for (UserPermissionAssign userRequest
                : request.getUsers()) {

            Long userId =
                    userRequest.getUserId();

            validation.validate(userId);

            UserEntity user =
                    accessService.findAccessibleUserAccess(
                            userId
                    );

            validation.validateRequestSize(
                    userRequest.getPermissions().size()
            );

            for (UserPermissionRequest dto
                    : userRequest.getPermissions()) {

                ModuleActionEntity moduleAction =
                        accessService.findModuleAction(
                                dto.getModuleActionId()
                        );

                validation.validateDuplicatePermission(
                        user,
                        moduleAction
                );

                UserBasedPermission permission =
                        UserBasedPermission.builder()
                                .user(user)
                                .role(user.getRole())
                                .module(moduleAction.getModule())
                                .action(moduleAction.getAction())
                                .allowed(dto.getAllowed())
                                .build();

                permissions.add(permission);
            }
        }

        permissions =
                userPermissionRepository.saveAll(
                        permissions
                );

        return mapper.toDTO(permissions);
    }


    // =========================================================
    // UPDATE USER PERMISSIONS
    // =========================================================

    @Override
    @Transactional
    public List<UserPermissionResponse> updatePermissions(
            Long userId,
            AssignUserPermissionRequest request) {

        validation.validate(userId);

        validation.validateRequestSize(
                request.getPermissions().size()
        );

        UserEntity user =
                accessService.findAccessibleUserAccess(userId);

        List<UserBasedPermission> permissions =
                new ArrayList<>();

        for (UserPermissionRequest dto
                : request.getPermissions()) {

            ModuleActionEntity moduleAction =
                    accessService.findModuleAction(
                            dto.getModuleActionId()
                    );

            /*
             * If the user permission already exists,
             * update it.
             *
             * If it does not exist, create it.
             *
             * This prevents:
             * "User permission not found."
             */
            UserBasedPermission permission =
                    userPermissionRepository
                            .findByUserAndModuleAndAction(
                                    user,
                                    moduleAction.getModule(),
                                    moduleAction.getAction()
                            )
                            .orElseGet(() ->
                                    UserBasedPermission.builder()
                                            .user(user)
                                            .role(user.getRole())
                                            .module(moduleAction.getModule())
                                            .action(moduleAction.getAction())
                                            .build()
                            );

            permission.setAllowed(
                    dto.getAllowed()
            );

            permissions.add(permission);
        }

        permissions =
                userPermissionRepository.saveAll(
                        permissions
                );

        return mapper.toDTO(permissions);
    }


    // =========================================================
    // BULK UPDATE USER PERMISSIONS
    // =========================================================

    @Override
    @Transactional
    public List<UserPermissionResponse> bulkUpdatePermissions(
            BulkAssignUserPermissionRequest request) {

        validation.validateRequestSize(
                request.getUsers().size()
        );

        List<UserBasedPermission> permissions =
                new ArrayList<>();

        for (UserPermissionAssign userRequest
                : request.getUsers()) {

            Long userId =
                    userRequest.getUserId();

            validation.validate(userId);

            UserEntity user =
                    accessService.findAccessibleUserAccess(
                            userId
                    );

            validation.validateRequestSize(
                    userRequest.getPermissions().size()
            );

            for (UserPermissionRequest dto
                    : userRequest.getPermissions()) {

                ModuleActionEntity moduleAction =
                        accessService.findModuleAction(
                                dto.getModuleActionId()
                        );

                /*
                 * Existing permission -> update
                 * Missing permission  -> create
                 */
                UserBasedPermission permission =
                        userPermissionRepository
                                .findByUserAndModuleAndAction(
                                        user,
                                        moduleAction.getModule(),
                                        moduleAction.getAction()
                                )
                                .orElseGet(() ->
                                        UserBasedPermission.builder()
                                                .user(user)
                                                .role(user.getRole())
                                                .module(moduleAction.getModule())
                                                .action(moduleAction.getAction())
                                                .build()
                                );

                permission.setAllowed(
                        dto.getAllowed()
                );

                permissions.add(permission);
            }
        }

        permissions =
                userPermissionRepository.saveAll(
                        permissions
                );

        return mapper.toDTO(permissions);
    }


    // =========================================================
    // GET ALL USER PERMISSIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<UserPermissionResponse> getAll() {

        return mapper.toDTO(
                accessService.findAccessibleUserPermissions()
        );
    }


    // =========================================================
    // GET USER PERMISSION BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public UserPermissionResponse getById(
            Long id) {

        return mapper.toDTO(
                accessService.findAccessibleUserPermissionById(
                        id
                )
        );
    }


    // =========================================================
    // DELETE USER PERMISSION
    // =========================================================

    @Override
    @Transactional
    public void deleteById(Long id) {

        UserBasedPermission permission =
                accessService.findAccessibleUserPermissionById(id);

        if (permission.getUser() != null
                && permission.getUser().getId() != null
                && permission.getUser().getId().equals(1L)) {

            throw new ValidationException(
                    "Super admin access cannot be deleted"
            );
        }

        userPermissionRepository.delete(permission);
    }


    // =========================================================
    // GET PERMISSIONS BY USER
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<UserPermissionResponse> getByUser(
            Long userId) {

        UserEntity user =
                accessService.findAccessibleUserAccess(userId);

        return mapper.toDTO(
                userPermissionRepository
                        .findByUser_IdWithRelations(
                                user.getId()
                        )
        );
    }


    // =========================================================
    // GET CURRENT USER PERMISSION MATRIX
    //
    // USER PERMISSION HAS PRIORITY
    // ROLE PERMISSION IS FALLBACK
    // NO PERMISSION = FALSE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<UserPermissionMatrixResponse> getUserPermission() {

        UserEntity user =
                currentUserService.getCurrentUser();

        validateUserForPermissionMatrix(user);

        return buildPermissionMatrix(user);
    }


    // =========================================================
    // GET USER PERMISSION MATRIX BY USER ID
    //
    // USER PERMISSION HAS PRIORITY
    // ROLE PERMISSION IS FALLBACK
    // NO PERMISSION = FALSE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<UserPermissionMatrixResponse> getUserPermissionById(
            Long id) {

        UserEntity user =
                accessService.findAccessibleUserAccess(id);

        validateUserForPermissionMatrix(user);

        return buildPermissionMatrix(user);
    }


    // =========================================================
    // VALIDATE USER
    // =========================================================

    private void validateUserForPermissionMatrix(
            UserEntity user) {

        if (user == null) {

            throw new ResourceNotFoundException(
                    "User not found."
            );
        }

        if (!Boolean.TRUE.equals(user.getActive())) {

            throw new ValidationException(
                    "User is not active"
            );
        }

        if (user.getRole() == null) {

            throw new ValidationException(
                    "User role not assigned"
            );
        }
    }


    // =========================================================
    // BUILD USER PERMISSION MATRIX
    // =========================================================

    private List<UserPermissionMatrixResponse> buildPermissionMatrix(
            UserEntity user) {

        Long userId =
                user.getId();

        Long roleId =
                user.getRole().getId();

        // =====================================================
        // GET ALL MODULE ACTIONS
        // =====================================================

        List<ModuleActionEntity> moduleActions =
                moduleActionRepository
                        .findAllByOrderByModuleIdAscActionIdAsc();

        // =====================================================
        // GROUP BY MODULE
        // =====================================================

        Map<Long, UserPermissionMatrixResponse> moduleMap =
                new LinkedHashMap<>();

        for (ModuleActionEntity moduleAction
                : moduleActions) {

            if (moduleAction.getModule() == null
                    || moduleAction.getAction() == null) {

                continue;
            }

            Long moduleId =
                    moduleAction.getModule().getId();

            Long actionId =
                    moduleAction.getAction().getId();

            // =================================================
            // USER PERMISSION FIRST
            // =================================================

            Optional<UserBasedPermission> userPermission =
                    userPermissionRepository
                            .findByUserIdAndModuleIdAndActionId(
                                    userId,
                                    moduleId,
                                    actionId
                            );

            boolean allowed;

            if (userPermission.isPresent()) {

                /*
                 * User-specific permission has highest priority.
                 */
                allowed =
                        userPermission
                                .get()
                                .isAllowed();

            } else {

                // =============================================
                // ROLE PERMISSION FALLBACK
                // =============================================

                Optional<RoleBasedPermission> rolePermission =
                        roleBasedPermissionRepository
                                .findByRoleIdAndModuleIdAndActionId(
                                        roleId,
                                        moduleId,
                                        actionId
                                );

                /*
                 * If role permission does not exist,
                 * permission defaults to false.
                 */
                allowed =
                        rolePermission
                                .map(RoleBasedPermission::isAllowed)
                                .orElse(false);
            }

            // =================================================
            // CREATE / GET MODULE DTO
            // =================================================

            UserPermissionMatrixResponse moduleDTO =
                    moduleMap.computeIfAbsent(
                            moduleId,
                            key -> new UserPermissionMatrixResponse(
                                    userId,
                                    moduleId,
                                    moduleAction
                                            .getModule()
                                            .getModuleName(),
                                    new ArrayList<>()
                            )
                    );

            // =================================================
            // ADD ACTION
            // =================================================

            ActionPermission actionDTO =
                    new ActionPermission(
                            actionId,
                            moduleAction
                                    .getAction()
                                    .getActionName(),
                            allowed
                    );

            moduleDTO
                    .getActions()
                    .add(actionDTO);
        }

        return new ArrayList<>(
                moduleMap.values()
        );
    }
}
