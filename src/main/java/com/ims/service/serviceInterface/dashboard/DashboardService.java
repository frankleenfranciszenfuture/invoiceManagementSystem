package com.ims.service.serviceInterface.dashboard;

import com.ims.dtos.dashbaord.DashboardFilterRequest;
import com.ims.dtos.dashbaord.DashboardOverviewResponse;

public interface DashboardService {

    DashboardOverviewResponse getDashboard(
            DashboardFilterRequest request
    );
}