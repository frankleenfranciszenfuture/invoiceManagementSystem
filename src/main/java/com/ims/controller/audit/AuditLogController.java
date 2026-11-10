package com.ims.controller.audit;



import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;


import com.ims.dtos.audit.AuditLogResponse;
import com.ims.dtos.audit.AuditLogSearchRequest;


import com.ims.enums.audit.AuditAction;
import com.ims.service.serviceInterface.audit.AuditLogService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    /**
     * Get all audit logs with filters and pagination.
     */
    @GetMapping
    public ApiResponse<PageResponse<AuditLogResponse>>
    getAllAuditLogs(

            @RequestParam(required = false)
            String entityName,

            @RequestParam(required = false)
            String entityId,

            @RequestParam(required = false)
            AuditAction action,

            @RequestParam(required = false)
            Long performedBy,

            @RequestParam(required = false)
            String performedByType,

            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            java.time.LocalDateTime fromDate,

            @RequestParam(required = false)
            java.time.LocalDateTime toDate,

            @RequestParam(defaultValue = "0")
            Integer page,

            @RequestParam(defaultValue = "10")
            Integer size,

            @RequestParam(defaultValue = "createdAt")
            String sortBy,

            @RequestParam(defaultValue = "DESC")
            String sortDirection

    ) {

        AuditLogSearchRequest request =
                AuditLogSearchRequest.builder()
                        .entityName(entityName)
                        .entityId(entityId)
                        .action(action)
                        .performedBy(performedBy)
                        .performedByType(performedByType)
                        .keyword(keyword)
                        .fromDate(fromDate)
                        .toDate(toDate)
                        .page(page)
                        .size(size)
                        .sortBy(sortBy)
                        .sortDirection(sortDirection)
                        .build();

        return ApiResponse.success(
                auditLogService.getAllAuditLogs(request),
                "Audit logs fetched successfully."
        );
    }

    /**
     * Get audit log details.
     */
    @GetMapping("/{id}")
    public ApiResponse<AuditLogResponse> getAuditLogById(
            @PathVariable Long id) {

        return ApiResponse.success(
                auditLogService.getAuditLogById(id),
                "Audit log fetched successfully."
        );
    }

    /**
     * Get history of a particular record.
     */
    @GetMapping("/entity/{entityName}/{entityId}")
    public ApiResponse<PageResponse<AuditLogResponse>>
    getEntityHistory(

            @PathVariable String entityName,

            @PathVariable String entityId,

            @RequestParam(defaultValue = "0")
            Integer page,

            @RequestParam(defaultValue = "10")
            Integer size

    ) {

        return ApiResponse.success(
                auditLogService.getEntityHistory(
                        entityName,
                        entityId,
                        page,
                        size
                ),
                "Entity audit history fetched successfully."
        );
    }
}

