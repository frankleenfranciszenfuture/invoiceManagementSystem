package com.ims.repository.permission;


import com.ims.entity.ActionEntity;
import com.ims.entity.ModuleEntity;
import com.ims.entity.RoleBasedPermission;
import com.ims.entity.RoleEntity;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoleBasedPermissionRepository
        extends JpaRepository<RoleBasedPermission, Long> {

    boolean existsByRoleAndModuleAndAction(
            RoleEntity role,
            ModuleEntity module,
            ActionEntity action
    );

    Optional<RoleBasedPermission>
    findByRoleAndModuleAndAction(
            RoleEntity role,
            ModuleEntity module,
            ActionEntity action
    );

    List<RoleBasedPermission>
    findByRole(RoleEntity role);

    List<RoleBasedPermission>
    findByRoleAndModule(
            RoleEntity role,
            ModuleEntity module
    );
}
