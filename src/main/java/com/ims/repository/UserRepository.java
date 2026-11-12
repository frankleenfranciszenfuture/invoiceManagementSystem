package com.ims.repository;

import com.ims.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    Boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(
            String email,
            Long id);

    // =========================================================
    // FIND USER BY USER ID
    // =========================================================

    @Query("""
            SELECT u
            FROM UserEntity u
            LEFT JOIN FETCH u.role
            WHERE u.userId = :userId
            """)
    Optional<UserEntity> findByUserIdWithRole(
            @Param("userId") String userId);

    // =========================================================
    // FIND USER WITH ROLE BY DATABASE ID
    // =========================================================

    @Query("""
            SELECT u
            FROM UserEntity u
            LEFT JOIN FETCH u.role
            WHERE u.id = :id
            """)
    Optional<UserEntity> findByIdWithRole(
            @Param("id") Long id);

    @Query("""
    SELECT u.id
    FROM UserEntity u
    JOIN u.role r
    WHERE UPPER(r.roleName) = UPPER(:roleName)
      AND u.active = true
""")
    java.util.Set<Long> findActiveUserIdsByRoleName(
            @Param("roleName") String roleName
    );

    @Query("""
    SELECT u.id
    FROM UserEntity u
    JOIN u.role r
    WHERE UPPER(r.roleName) IN :roleNames
      AND u.active = true
""")
    java.util.Set<Long> findActiveUserIdsByRoleNames(
            @Param("roleNames") java.util.Collection<String> roleNames
    );
}