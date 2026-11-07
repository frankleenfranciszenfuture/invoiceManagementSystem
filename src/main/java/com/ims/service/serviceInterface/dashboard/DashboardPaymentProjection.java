package com.ims.service.serviceInterface.dashboard;


import java.math.BigDecimal;


import java.math.BigDecimal;

public interface DashboardPaymentProjection {

    Object getDirection();

    Object getStatus();

    String getChannel();

    Long getCount();

    BigDecimal getAmount();
}
