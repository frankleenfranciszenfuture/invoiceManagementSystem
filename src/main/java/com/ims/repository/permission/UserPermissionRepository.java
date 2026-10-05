package com.ims.repository.permission;

import com.ims.entity.ActionEntity;
import com.ims.entity.ModuleEntity;
import com.ims.entity.UserBasedPermission;
import com.ims.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserPermissionRepository
        extends JpaRepository<UserBasedPermission, Long> {

    Optional<UserBasedPermission> findByUserAndModuleAndAction(
            UserEntity user,
            ModuleEntity module,
            ActionEntity action
    );

    List<UserBasedPermission> findByUser(
            UserEntity user
    );
}