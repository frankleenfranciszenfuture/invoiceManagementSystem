package com.ims.repository.permission;

import com.ims.entity.ActionEntity;
import com.ims.entity.ModuleEntity;
import com.ims.entity.RoleBasedPermission;
import com.ims.entity.RoleEntity;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleBasedPermissionRepository
        extends JpaRepository<RoleBasedPermission, Long> {

    /* =========================================================
       FIND BY ROLE
       ========================================================= */

    @Query("""
        SELECT rp
        FROM RoleBasedPermission rp
        JOIN FETCH rp.role
        JOIN FETCH rp.module
        JOIN FETCH rp.action
        WHERE rp.role.id = :roleId
        ORDER BY rp.module.moduleName,
                 rp.action.actionName
        """)
    List<RoleBasedPermission> findByRoleId(
            @Param("roleId") Long roleId
    );


    /* =========================================================
       FIND SINGLE PERMISSION
       ========================================================= */

    Optional<RoleBasedPermission>
    findByRole_IdAndModule_IdAndAction_Id(
            Long roleId,
            Long moduleId,
            Long actionId
    );


    Optional<RoleBasedPermission>
    findByRoleIdAndModuleIdAndActionId(
            Long roleId,
            Long moduleId,
            Long actionId
    );


    /* =========================================================
       DUPLICATE CHECK
       ========================================================= */

    boolean existsByRole_IdAndModule_IdAndAction_Id(
            Long roleId,
            Long moduleId,
            Long actionId
    );


    boolean existsByRoleAndModuleAndAction(
            RoleEntity role,
            ModuleEntity module,
            ActionEntity action
    );


    /* =========================================================
       DELETE ROLE PERMISSIONS
       ========================================================= */

    void deleteByRole_Id(Long roleId);


    /* =========================================================
       FIND ALL
       ========================================================= */

    @Query("""
        SELECT rp
        FROM RoleBasedPermission rp
        JOIN FETCH rp.role
        JOIN FETCH rp.module
        JOIN FETCH rp.action
        """)
    List<RoleBasedPermission> findAllWithRoleModuleAction();


    /* =========================================================
       FIND BY ID WITH RELATIONS
       ========================================================= */

    @Query("""
        SELECT rp
        FROM RoleBasedPermission rp
        JOIN FETCH rp.role
        JOIN FETCH rp.module
        JOIN FETCH rp.action
        WHERE rp.id = :id
        """)
    Optional<RoleBasedPermission> findByIdWithRelations(
            @Param("id") Long id
    );


    /* =========================================================
       FIND BY ROLE ENTITY
       ========================================================= */

    @Query("""
        SELECT rp
        FROM RoleBasedPermission rp
        JOIN FETCH rp.module
        JOIN FETCH rp.action
        WHERE rp.role = :role
        """)
    List<RoleBasedPermission> findByRole(
            @Param("role") RoleEntity role
    );


    /* =========================================================
       AUDIT
       ========================================================= */

    @EntityGraph(attributePaths = {
            "role",
            "module",
            "action"
    })
    @Query("""
        SELECT p
        FROM RoleBasedPermission p
        WHERE p.role.id = :roleId
        ORDER BY p.id
        """)
    List<RoleBasedPermission> findAllByRoleIdForAudit(
            @Param("roleId") Long roleId
    );
}