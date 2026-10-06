package com.ims.repository.permission;

import com.ims.entity.ActionEntity;
import com.ims.entity.ModuleActionEntity;
import com.ims.entity.ModuleEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

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
}
