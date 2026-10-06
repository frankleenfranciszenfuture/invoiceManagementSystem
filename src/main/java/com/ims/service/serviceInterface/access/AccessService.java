package com.ims.service.serviceInterface.access;


import com.ims.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AccessService {

    UserEntity findAccessibleUser(Long id);

    Page<UserEntity> findAccessibleUsers(Pageable pageable);

    RoleEntity findAccessibleRole(Long id);

    List<RoleEntity> findAccessibleRoles();

    ModuleActionEntity findModuleAction(Long id);

    UserEntity findAccessibleUserAccess(Long id);

    List<UserBasedPermission> findAccessibleUserPermissions();

    UserBasedPermission findAccessibleUserPermissionById(
            Long id);

    List<UserEntity> findAccessibleUsersAccess();
}

