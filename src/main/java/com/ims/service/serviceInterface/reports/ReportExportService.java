package com.ims.service.serviceInterface.reports;


import com.ims.dtos.reports.ReportRequest;

public interface ReportExportService {

    byte[] exportPdf(ReportRequest request);

    byte[] exportExcel(ReportRequest request);

    byte[] exportCsv(ReportRequest request);

    String exportPrint(ReportRequest request);

}