package com.ims.repository.permission;


import com.ims.entity.ActionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActionRepository extends JpaRepository<ActionEntity, Long> {

    boolean existsByActionName(String actionName);
    Optional<ActionEntity> findByActionName(String name);
}
