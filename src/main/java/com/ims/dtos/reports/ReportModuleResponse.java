package com.ims.dtos.reports;

import com.ims.enums.reports.ReportModule;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportModuleResponse {

    private ReportModule module;

    private String moduleName;

    private int reportCount;

}