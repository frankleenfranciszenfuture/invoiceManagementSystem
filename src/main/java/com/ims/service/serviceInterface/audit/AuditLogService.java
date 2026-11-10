package com.ims.service.serviceInterface.audit;



import com.ims.common.PageResponse;
import com.ims.dtos.audit.AuditLogCreateRequest;
import com.ims.dtos.audit.AuditLogResponse;
import com.ims.dtos.audit.AuditLogSearchRequest;

public interface AuditLogService {

    void createAuditLog(
            AuditLogCreateRequest request
    );

    PageResponse<AuditLogResponse> getAllAuditLogs(
            AuditLogSearchRequest request
    );

    AuditLogResponse getAuditLogById(Long id);

    PageResponse<AuditLogResponse> getEntityHistory(
            String entityName,
            String entityId,
            Integer page,
            Integer size
    );
}
