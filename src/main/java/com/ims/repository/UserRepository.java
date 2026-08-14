package com.ims.repository;

import com.ims.entity.UserEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {


    Optional<UserEntity> findByEmail(String email);

    Boolean existsByEmail(String email);


    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(
            String email,
            Long id);


    @Query("""
                SELECT u
                FROM UserEntity u
                LEFT JOIN FETCH u.role
                WHERE u.id = :id
            """)
    Optional<UserEntity> findByIdWithRole(@Param("id") Long id);
}