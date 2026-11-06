package com.ims.controller.reports;


import com.ims.common.ApiResponse;
import com.ims.dtos.reports.ReportCatalogResponse;
import com.ims.dtos.reports.ReportModuleResponse;
import com.ims.dtos.reports.ReportPreviewResponse;
import com.ims.dtos.reports.ReportRequest;
import com.ims.enums.reports.ReportModule;
import com.ims.service.serviceInterface.reports.ReportExportService;
import com.ims.service.serviceInterface.reports.ReportService;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    private final ReportExportService exportService;

    // =====================================================
    // 1. AVAILABLE REPORT MODULES
    // GET /reports/modules
    // =====================================================

    @GetMapping("/modules")
    public ResponseEntity<ApiResponse<List<ReportModuleResponse>>>
    getModules() {

        List<ReportModuleResponse> response =
                reportService.getModules();

        return ResponseEntity.ok(
                ApiResponse.success(
                        response,
                        "Report modules fetched successfully."
                )
        );
    }

    // =====================================================
    // 2. REPORT CATALOG
    // GET /reports/catalog/{module}
    // =====================================================

    @GetMapping("/catalog/{module}")
    public ResponseEntity<ApiResponse<ReportCatalogResponse>>
    getCatalog(
            @PathVariable String module) {

        ReportCatalogResponse response =
                reportService.getCatalog(module);

        return ResponseEntity.ok(
                ApiResponse.success(
                        response,
                        "Report catalog fetched successfully."
                )
        );
    }

    // =====================================================
    // 3. REPORT PREVIEW
    // POST /reports/preview
    // =====================================================

    @PostMapping("/{module}/preview")
    public ResponseEntity<ApiResponse<ReportPreviewResponse>> preview(
            @PathVariable String module,
            @Valid @RequestBody ReportRequest request
    ) {

        ReportModule reportModule;

        try {
            reportModule = ReportModule.fromValue(module);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid report module: " + module
            );
        }

        // URL module is the source of truth
        request.setModule(reportModule);

        ReportPreviewResponse response =
                reportService.preview(request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        response,
                        "Report preview generated successfully."
                )
        );
    }
    // =====================================================
    // 4. PDF EXPORT
    // POST /reports/export/pdf
    // =====================================================

    @PostMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @Valid @RequestBody ReportRequest request) {

        byte[] file = exportService.exportPdf(request);

        return attachment(
                file,
                getFileName(request, "pdf"),
                MediaType.APPLICATION_PDF
        );
    }

    // =====================================================
    // 5. EXCEL EXPORT
    // POST /reports/export/excel
    // =====================================================

    @PostMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel(
            @Valid @RequestBody ReportRequest request) {

        byte[] file = exportService.exportExcel(request);

        MediaType excelType = MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        return attachment(
                file,
                getFileName(request, "xlsx"),
                excelType
        );
    }

    // =====================================================
    // 6. CSV EXPORT
    // POST /reports/export/csv
    // =====================================================

    @PostMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(
            @Valid @RequestBody ReportRequest request) {

        byte[] file = exportService.exportCsv(request);

        MediaType csvType = MediaType.parseMediaType(
                "text/csv;charset=UTF-8"
        );

        return attachment(
                file,
                getFileName(request, "csv"),
                csvType
        );
    }

    // =====================================================
    // 7. PRINT EXPORT
    // POST /reports/export/print
    // =====================================================

    @PostMapping("/export/print")
    public ResponseEntity<byte[]> exportPrint(
            @Valid @RequestBody ReportRequest request) {

        String html = exportService.exportPrint(request);

        byte[] file = html.getBytes(StandardCharsets.UTF_8);

        String fileName = getFileName(request, "html");

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline()
                                .filename(fileName, StandardCharsets.UTF_8)
                                .build()
                                .toString()
                )
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(file);
    }

    // =====================================================
    // COMMON DOWNLOAD RESPONSE
    // =====================================================

    private ResponseEntity<byte[]> attachment(
            byte[] file,
            String fileName,
            MediaType contentType) {

        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(contentType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(
                                        fileName,
                                        StandardCharsets.UTF_8
                                )
                                .build()
                                .toString()
                )
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(file);
    }

    // =====================================================
    // FILE NAME
    // =====================================================

    private String getFileName(
            ReportRequest request,
            String extension) {

        String module = request.getModule()
                .name()
                .toLowerCase(Locale.ROOT);

        String report = request.getReportCode()
                .replaceAll("[^a-zA-Z0-9_-]", "_")
                .toLowerCase(Locale.ROOT);

        return module + "_" + report + "_report." + extension;
    }
}