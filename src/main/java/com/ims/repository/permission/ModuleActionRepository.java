package com.ims.repository.permission;

import com.ims.entity.ActionEntity;
import com.ims.entity.ModuleActionEntity;
import com.ims.entity.ModuleEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleActionRepository extends JpaRepository<ModuleActionEntity, Long> {

    boolean existsByModuleAndAction(ModuleEntity module, ActionEntity action);

    @Query("""
            SELECT ma
            FROM ModuleActionEntity ma
            JOIN FETCH ma.module
            JOIN FETCH ma.action
            ORDER BY ma.moduleName, ma.actionName
            """)
    List<ModuleActionEntity> findAllWithModuleAndAction();

    List<ModuleActionEntity> findAllByOrderByModuleIdAscActionIdAsc();

    @Query("""
        SELECT ma
        FROM ModuleActionEntity ma
        JOIN FETCH ma.module m
        JOIN FETCH ma.action a
        WHERE UPPER(m.moduleName) = UPPER(:moduleName)
        AND UPPER(a.actionName) = UPPER(:actionName)
        AND m.active = true
        AND a.active = true
        """)
    Optional<ModuleActionEntity> findActiveModuleAction(
            @Param("moduleName") String moduleName,
            @Param("actionName") String actionName
    );
}
