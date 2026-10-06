package com.ims.repository.permission;

import com.ims.entity.ModuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<ModuleEntity, Long> {

    boolean existsByModuleName(String moduleName);
    Optional<ModuleEntity> findByModuleName(String name);
}
