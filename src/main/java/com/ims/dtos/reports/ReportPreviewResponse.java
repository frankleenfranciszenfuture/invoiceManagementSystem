package com.ims.dtos.reports;


import com.ims.common.PageResponse;
import com.ims.enums.reports.ReportModule;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportPreviewResponse {

    private ReportModule module;

    private String reportCode;

    private String reportName;

    private List<ReportColumn> columns;

    private PageResponse<ReportResponse> rows;

    private ReportSummaryResponse summary;

}
