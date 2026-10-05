package com.ims.repository.permission;

import com.ims.entity.ActionEntity;
import com.ims.entity.ModuleActionEntity;
import com.ims.entity.ModuleEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ModuleActionRepository
        extends JpaRepository<ModuleActionEntity, Long> {

    boolean existsByModuleAndAction(
            ModuleEntity module,
            ActionEntity action
    );

    List<ModuleActionEntity>
    findByModule(ModuleEntity module);

    List<ModuleActionEntity>
    findByAction(ActionEntity action);


    @Query("""
        SELECT ma
        FROM ModuleActionEntity ma
        JOIN FETCH ma.module
        JOIN FETCH ma.action
        """)
    List<ModuleActionEntity>
    findAllWithModuleAndAction();
}
