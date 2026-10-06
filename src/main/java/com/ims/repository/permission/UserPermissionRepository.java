package com.ims.repository.permission;

import com.ims.entity.ActionEntity;
import com.ims.entity.ModuleEntity;
import com.ims.entity.RoleEntity;
import com.ims.entity.UserBasedPermission;
import com.ims.entity.UserEntity;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserPermissionRepository
        extends JpaRepository<UserBasedPermission, Long> {

    /* =========================================================
       DUPLICATE CHECK
       ========================================================= */

    boolean existsByUserAndModuleAndAction(
            UserEntity user,
            ModuleEntity module,
            ActionEntity action
    );


    /* =========================================================
       FIND ALL
       ========================================================= */

    @EntityGraph(attributePaths = {
            "user",
            "role",
            "user.role",
            "module",
            "action"
    })
    @Override
    List<UserBasedPermission> findAll();


    /* =========================================================
       FIND BY ID WITH RELATIONS
       ========================================================= */

    @Query("""
        SELECT up
        FROM UserBasedPermission up
        JOIN FETCH up.user
        JOIN FETCH up.user.role
        JOIN FETCH up.role
        JOIN FETCH up.module
        JOIN FETCH up.action
        WHERE up.id = :id
        """)
    Optional<UserBasedPermission> findByIdWithRelations(
            @Param("id") Long id
    );


    /* =========================================================
       FIND ALL WITH RELATIONS
       ========================================================= */

    @Query("""
        SELECT up
        FROM UserBasedPermission up
        JOIN FETCH up.user
        JOIN FETCH up.user.role
        JOIN FETCH up.role
        JOIN FETCH up.module
        JOIN FETCH up.action
        """)
    List<UserBasedPermission> findAllWithRelations();


    /* =========================================================
       FIND BY USER
       ========================================================= */

    List<UserBasedPermission> findByUser(UserEntity user);


    @Query("""
        SELECT up
        FROM UserBasedPermission up
        JOIN FETCH up.user
        JOIN FETCH up.user.role
        JOIN FETCH up.role
        JOIN FETCH up.module
        JOIN FETCH up.action
        WHERE up.user.id = :userId
        """)
    List<UserBasedPermission> findByUser_IdWithRelations(
            @Param("userId") Long userId
    );


    List<UserBasedPermission> findAllByUserId(Long id);


    /* =========================================================
       FIND SINGLE USER PERMISSION
       ========================================================= */

    Optional<UserBasedPermission> findByUserAndModuleAndAction(
            UserEntity user,
            ModuleEntity module,
            ActionEntity action
    );


    Optional<UserBasedPermission>
    findByUserIdAndModuleIdAndActionId(
            Long userId,
            Long moduleId,
            Long actionId
    );


    /* =========================================================
       DELETE USER PERMISSIONS
       ========================================================= */

    @Modifying
    @Transactional
    @Query("""
        DELETE FROM UserBasedPermission up
        WHERE up.user = :user
        """)
    void deleteByUser(
            @Param("user") UserEntity user
    );


    /* =========================================================
       AUDIT
       ========================================================= */

    @EntityGraph(attributePaths = {
            "user",
            "user.role",
            "role",
            "module",
            "action"
    })
    @Query("""
        SELECT p
        FROM UserBasedPermission p
        WHERE p.id = :id
        """)
    Optional<UserBasedPermission> findByIdForAudit(
            @Param("id") Long id
    );
}