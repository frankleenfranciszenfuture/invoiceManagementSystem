package com.ims.service.serviceInterface.dashboard;

import java.math.BigDecimal;

public interface DashboardMonthlyTrendProjection {

    Integer getYear();

    Integer getMonth();

    BigDecimal getAmount();
}

