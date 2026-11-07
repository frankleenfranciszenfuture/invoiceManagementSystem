package com.ims.controller.dashboard;



import com.ims.dtos.dashbaord.DashboardFilterRequest;
import com.ims.dtos.dashbaord.DashboardOverviewResponse;
import com.ims.service.serviceInterface.dashboard.DashboardService;
import jakarta.validation.constraints.NotNull;

import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Validated
public class DashboardController {

    private final DashboardService dashboardService;

    // =====================================================
    // GET DASHBOARD
    // =====================================================

    @GetMapping
    public ResponseEntity<DashboardOverviewResponse> getDashboard(

            @RequestParam(required = false)
            String period,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate

    ) {

        DashboardFilterRequest request =
                new DashboardFilterRequest();

        request.setPeriod(
                period == null || period.isBlank()
                        ? "LAST_30_DAYS"
                        : period
        );

        request.setFromDate(fromDate);
        request.setToDate(toDate);

        DashboardOverviewResponse response =
                dashboardService.getDashboard(request);

        return ResponseEntity.ok(response);
    }
}
