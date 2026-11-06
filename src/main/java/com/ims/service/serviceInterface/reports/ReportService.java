package com.ims.service.serviceInterface.reports;


import com.ims.dtos.reports.*;

import java.util.List;

public interface ReportService {

    List<ReportModuleResponse> getModules();

    ReportCatalogResponse getCatalog(String module);

    ReportPreviewResponse preview(ReportRequest request);

    ReportData generateAll(ReportRequest request);

}