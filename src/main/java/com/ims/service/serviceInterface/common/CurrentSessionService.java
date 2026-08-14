package com.ims.service.serviceInterface.common;

import com.ims.config.CurrentSession;

public interface CurrentSessionService {

    CurrentSession getCurrentSession();

    boolean isUser();

    boolean isEmployee();

    Long getUserId();

    Long getEmployeeId();
}
