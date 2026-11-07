package com.ims.repository;

import com.ims.entity.ExpenseEntity;

import com.ims.enums.ExpenseStatus;

import com.ims.service.serviceInterface.dashboard.ExpenseSummaryProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
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

    @Query("""
    SELECT COALESCE(SUM(e.baseTotalAmount), 0)
    FROM ExpenseEntity e
    WHERE e.active = true
      AND e.expenseDate BETWEEN :fromDate AND :toDate
    """)
    BigDecimal calculateDashboardTotalExpenses(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    @Query("""
    SELECT
        e.expenseCategory.id AS expenseCategoryId,
        e.expenseCategory.categoryName AS categoryName,
        SUM(e.baseTotalAmount) AS amount,
        COUNT(e.id) AS transactionCount
    FROM ExpenseEntity e
    WHERE e.active = true
      AND e.expenseDate BETWEEN :fromDate AND :toDate
    GROUP BY e.expenseCategory.id, e.expenseCategory.categoryName
    ORDER BY SUM(e.baseTotalAmount) DESC
    """)
    List<ExpenseSummaryProjection> findDashboardTopExpenses(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    @Query("""
    SELECT COALESCE(SUM(e.baseTotalAmount), 0)
    FROM ExpenseEntity e
    WHERE e.active = true
      AND e.expenseStatus = :status
      AND e.expenseDate BETWEEN :fromDate AND :toDate
    """)
    BigDecimal calculateDashboardTotalExpenses(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("status") ExpenseStatus status
    );

    @Query("""
    SELECT
        e.expenseCategory.id AS expenseCategoryId,
        e.expenseCategory.categoryName AS categoryName,
        SUM(e.baseTotalAmount) AS amount,
        COUNT(e.id) AS transactionCount
    FROM ExpenseEntity e
    WHERE e.active = true
      AND e.expenseStatus = :status
      AND e.expenseDate BETWEEN :fromDate AND :toDate
    GROUP BY e.expenseCategory.id, e.expenseCategory.categoryName
    ORDER BY SUM(e.baseTotalAmount) DESC
    """)
    List<ExpenseSummaryProjection> findDashboardTopExpenses(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("status") ExpenseStatus status
    );
}
