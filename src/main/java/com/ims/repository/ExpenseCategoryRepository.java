package com.ims.repository;


import com.ims.entity.ExpenseCategoryEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ExpenseCategoryRepository extends
        JpaRepository<ExpenseCategoryEntity, Long>,
        JpaSpecificationExecutor<ExpenseCategoryEntity> {

    boolean existsByCategoryNameIgnoreCase(String categoryName);

    boolean existsByCategoryNameIgnoreCaseAndIdNot(
            String categoryName,
            Long id
    );

    boolean existsByCategoryCode(String categoryCode);

    Optional<ExpenseCategoryEntity> findByIdAndActiveTrue(Long id);
}