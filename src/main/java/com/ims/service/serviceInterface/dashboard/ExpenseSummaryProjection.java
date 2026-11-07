package com.ims.service.serviceInterface.dashboard;


import java.math.BigDecimal;

public interface ExpenseSummaryProjection {

    Long getExpenseCategoryId();

    String getCategoryName();

    BigDecimal getAmount();

    Long getTransactionCount();
}