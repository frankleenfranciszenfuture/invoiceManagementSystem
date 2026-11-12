package com.ims.controller.audit;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.audit.AuditLogResponse;
import com.ims.dtos.audit.AuditLogSearchRequest;
import com.ims.enums.audit.AuditAction;
import com.ims.service.serviceInterface.audit.AuditLogService;
import com.ims.service.serviceInterface.audit.AuditLogExportService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;
    private final AuditLogExportService auditLogExportService;

    private static final DateTimeFormatter FILE_DATE_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /* =====================================================
       GET ALL AUDIT LOGS
    ===================================================== */

    @GetMapping
    public ApiResponse<PageResponse<AuditLogResponse>> getAllAuditLogs(

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
            LocalDateTime fromDate,

            @RequestParam(required = false)
            LocalDateTime toDate,

            @RequestParam(defaultValue = "0")
            Integer page,

            @RequestParam(defaultValue = "10")
            Integer size,

            @RequestParam(defaultValue = "createdAt")
            String sortBy,

            @RequestParam(defaultValue = "DESC")
            String sortDirection

    ) {

        AuditLogSearchRequest request = buildRequest(
                entityName,
                entityId,
                action,
                performedBy,
                performedByType,
                keyword,
                fromDate,
                toDate,
                page,
                size,
                sortBy,
                sortDirection
        );

        return ApiResponse.success(
                auditLogService.getAllAuditLogs(request),
                "Audit logs fetched successfully."
        );
    }

    /* =====================================================
       GET AUDIT LOG BY ID
    ===================================================== */

    @GetMapping("/{id}")
    public ApiResponse<AuditLogResponse> getAuditLogById(
            @PathVariable Long id
    ) {

        return ApiResponse.success(
                auditLogService.getAuditLogById(id),
                "Audit log fetched successfully."
        );
    }

    /* =====================================================
       GET ENTITY HISTORY
    ===================================================== */

    @GetMapping("/entity/{entityName}/{entityId}")
    public ApiResponse<PageResponse<AuditLogResponse>> getEntityHistory(

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

    /* =====================================================
       EXPORT PDF
    ===================================================== */

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(

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
            LocalDateTime fromDate,

            @RequestParam(required = false)
            LocalDateTime toDate,

            @RequestParam(defaultValue = "createdAt")
            String sortBy,

            @RequestParam(defaultValue = "DESC")
            String sortDirection

    ) {

        AuditLogSearchRequest request = buildRequest(
                entityName,
                entityId,
                action,
                performedBy,
                performedByType,
                keyword,
                fromDate,
                toDate,
                0,
                Integer.MAX_VALUE,
                sortBy,
                sortDirection
        );

        byte[] file = auditLogExportService.exportPdf(request);

        return createDownloadResponse(
                file,
                "pdf",
                "application/pdf",
                entityName
        );
    }

    /* =====================================================
       EXPORT EXCEL
    ===================================================== */

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel(

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
            LocalDateTime fromDate,

            @RequestParam(required = false)
            LocalDateTime toDate,

            @RequestParam(defaultValue = "createdAt")
            String sortBy,

            @RequestParam(defaultValue = "DESC")
            String sortDirection

    ) {

        AuditLogSearchRequest request = buildRequest(
                entityName,
                entityId,
                action,
                performedBy,
                performedByType,
                keyword,
                fromDate,
                toDate,
                0,
                Integer.MAX_VALUE,
                sortBy,
                sortDirection
        );

        byte[] file = auditLogExportService.exportExcel(request);

        return createDownloadResponse(
                file,
                "xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                entityName
        );
    }

    /* =====================================================
       EXPORT CSV
    ===================================================== */

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(

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
            LocalDateTime fromDate,

            @RequestParam(required = false)
            LocalDateTime toDate,

            @RequestParam(defaultValue = "createdAt")
            String sortBy,

            @RequestParam(defaultValue = "DESC")
            String sortDirection

    ) {

        AuditLogSearchRequest request = buildRequest(
                entityName,
                entityId,
                action,
                performedBy,
                performedByType,
                keyword,
                fromDate,
                toDate,
                0,
                Integer.MAX_VALUE,
                sortBy,
                sortDirection
        );

        byte[] file = auditLogExportService.exportCsv(request);

        return createDownloadResponse(
                file,
                "csv",
                "text/csv",
                entityName
        );
    }

    /* =====================================================
       BUILD SEARCH REQUEST
    ===================================================== */

    private AuditLogSearchRequest buildRequest(

            String entityName,
            String entityId,
            AuditAction action,
            Long performedBy,
            String performedByType,
            String keyword,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Integer page,
            Integer size,
            String sortBy,
            String sortDirection

    ) {

        return AuditLogSearchRequest.builder()
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
    }

    /* =====================================================
       DOWNLOAD RESPONSE
    ===================================================== */

    private ResponseEntity<byte[]> createDownloadResponse(

            byte[] file,
            String extension,
            String contentType,
            String entityName

    ) {

        String module = entityName == null || entityName.isBlank()
                ? "ALL"
                : entityName.toUpperCase().replaceAll("[^A-Z0-9_-]", "_");

        String filename = "AUDIT_"
                + module
                + "_"
                + LocalDate.now().format(FILE_DATE_FORMAT)
                + "."
                + extension;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\""
                )
                .contentLength(file.length)
                .body(file);
    }
}