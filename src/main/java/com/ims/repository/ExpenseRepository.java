package com.ims.repository;

import com.ims.entity.ExpenseEntity;

import com.ims.enums.ExpenseStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ExpenseRepository
        extends JpaRepository<ExpenseEntity, Long>,
        JpaSpecificationExecutor<ExpenseEntity> {

    boolean existsByExpenseNo(String expenseNo);

    Optional<ExpenseEntity> findByIdAndActiveTrue(Long id);

    boolean existsByExpenseCategoryId(Long categoryId);

    long countByExpenseCategoryIdAndExpenseStatusNot(
            Long categoryId,
            ExpenseStatus expenseStatus
    );
}
