package com.ims.service.impl.access;

import com.ims.entity.ModuleActionEntity;
import com.ims.entity.RoleEntity;
import com.ims.entity.UserBasedPermission;
import com.ims.entity.UserEntity;
import com.ims.exception.AccessDeniedException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.repository.RoleRepository;
import com.ims.repository.UserRepository;
import com.ims.repository.permission.ModuleActionRepository;
import com.ims.repository.permission.UserPermissionRepository;
import com.ims.service.serviceInterface.access.AccessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccessServiceImpl implements AccessService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ModuleActionRepository moduleActionRepository;
    private final UserPermissionRepository userPermissionRepository;
    // =====================================================
    // USER
    // =====================================================

    @Override
    public UserEntity findAccessibleUser(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found."));
    }

    @Override
    public Page<UserEntity> findAccessibleUsers(
            Pageable pageable) {

        return userRepository.findAll(pageable);
    }

    // =====================================================
    // ROLE
    // =====================================================

    @Override
    public RoleEntity findAccessibleRole(Long id) {

        return roleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Role not found."));
    }

    @Override
    public List<RoleEntity> findAccessibleRoles() {

        return roleRepository.findAll();
    }

    // =====================================================
    // MODULE ACTION
    // =====================================================

    @Override
    public ModuleActionEntity findModuleAction(Long id) {

        return moduleActionRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Module Action not found."));
    }


    // =========================================================
// USER ACCESS
// =========================================================

    @Override
    public UserEntity findAccessibleUserAccess(Long id) {

        UserEntity user =
                userRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found."));

        /*
         * Super Admin user cannot be modified.
         */
        if (user.getRole() != null
                && "SUPER_ADMIN".equalsIgnoreCase(
                user.getRole().getRoleName())) {

            throw new AccessDeniedException(
                    "You are not allowed to modify Super Admin users.");
        }

        return user;
    }


// =========================================================
// USER PERMISSIONS
// =========================================================

    @Override
    public List<UserBasedPermission> findAccessibleUserPermissions() {

        return userPermissionRepository
                .findAllWithRelations();
    }


// =========================================================
// USER PERMISSION BY ID
// =========================================================

    @Override
    public UserBasedPermission findAccessibleUserPermissionById(
            Long id) {

        UserBasedPermission permission =
                userPermissionRepository
                        .findByIdWithRelations(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User permission not found."));

        /*
         * Super Admin user permissions cannot be modified.
         */
        if (permission.getUser() != null
                && permission.getUser().getRole() != null
                && "SUPER_ADMIN".equalsIgnoreCase(
                permission.getUser()
                        .getRole()
                        .getRoleName())) {

            throw new AccessDeniedException(
                    "You are not allowed to modify Super Admin user permissions.");
        }

        return permission;
    }


// =========================================================
// USERS ACCESS
// =========================================================

    @Override
    public List<UserEntity> findAccessibleUsersAccess() {

        return userRepository.findAll();
    }
}