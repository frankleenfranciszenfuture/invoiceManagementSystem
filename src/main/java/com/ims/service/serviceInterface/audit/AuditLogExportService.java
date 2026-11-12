package com.ims.service.serviceInterface.audit;


import com.ims.dtos.audit.AuditLogSearchRequest;

public interface AuditLogExportService {

    byte[] exportPdf(AuditLogSearchRequest request);

    byte[] exportExcel(AuditLogSearchRequest request);

    byte[] exportCsv(AuditLogSearchRequest request);
}