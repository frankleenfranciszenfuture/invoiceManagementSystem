package com.ims.repository;


import com.ims.entity.RoleEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<RoleEntity, Long> {


    Optional<RoleEntity> findByRoleName(String roleName);

    boolean existsByRoleNameIgnoreCase(String roleName);

    boolean existsByRoleNameIgnoreCaseAndIdNot(String roleName,
                                               Long id);

    List<RoleEntity> findByIdOrRoleNameIn(
            Long Id,
            List<String> roleNames);


}
