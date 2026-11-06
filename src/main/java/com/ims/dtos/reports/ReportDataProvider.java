package com.ims.dtos.reports;



import com.ims.enums.reports.ReportModule;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReportDataProvider {

    ReportModule getModule();

    List<ReportDefinition> getReportDefinitions();

    ReportData generate(
            ReportRequest request,
            Pageable pageable
    );

}
