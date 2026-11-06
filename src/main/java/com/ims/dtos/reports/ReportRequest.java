package com.ims.dtos.reports;

import com.ims.enums.reports.ReportModule;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {

    @NotNull(message = "Report module is required.")
    private ReportModule module;

    @NotBlank(message = "Report code is required.")
    private String reportCode;

    @Valid
    @Builder.Default
    private ReportFilterRequest filters = new ReportFilterRequest();

    @Min(value = 0, message = "Page cannot be negative.")
    @Builder.Default
    private int page = 0;

    @Min(value = 1, message = "Page size must be greater than zero.")
    @Max(value = 500, message = "Maximum page size is 500.")
    @Builder.Default
    private int size = 20;

    private String sortBy;

    @Builder.Default
    private String sortDirection = "ASC";

    @Builder.Default
    private List<String> columns = new ArrayList<>();
}