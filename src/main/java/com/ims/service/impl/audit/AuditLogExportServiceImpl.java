package com.ims.service.impl.audit;

import com.ims.dtos.audit.AuditLogSearchRequest;
import com.ims.entity.AuditLogEntity;
import com.ims.enums.audit.AuditAction;
import com.ims.repository.audit.AuditLogRepository;
import com.ims.service.serviceInterface.audit.AuditLogExportColumnConfig;
import com.ims.service.serviceInterface.audit.AuditLogExportService;
import org.apache.poi.xssf.usermodel.DefaultIndexedColorMap;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.DefaultIndexedColorMap;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import jakarta.persistence.criteria.Predicate;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditLogExportServiceImpl implements AuditLogExportService {

    private final AuditLogRepository auditLogRepository;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id",
            "createdAt",
            "entityName",
            "action",
            "performedBy"
    );

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");

    /* =====================================================
       FETCH ALL FILTERED RECORDS
    ===================================================== */

    private List<AuditLogEntity> getFilteredRecords(
            AuditLogSearchRequest request
    ) {

        Specification<AuditLogEntity> specification =
                buildSpecification(request);

        String sortBy = request.getSortBy();

        if (sortBy == null ||
                !ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "createdAt";
        }

        Sort.Direction direction =
                "ASC".equalsIgnoreCase(request.getSortDirection())
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        Sort sort = Sort.by(direction, sortBy);

        // No PageRequest here.
        // This retrieves every matching audit record.
        return auditLogRepository.findAll(specification, sort);
    }

    /* =====================================================
       FILTER SPECIFICATION
    ===================================================== */

    private Specification<AuditLogEntity> buildSpecification(
            AuditLogSearchRequest request
    ) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (request.getEntityName() != null
                    && !request.getEntityName().isBlank()) {

                predicates.add(
                        cb.equal(
                                cb.upper(root.get("entityName")),
                                request.getEntityName()
                                        .trim()
                                        .toUpperCase(Locale.ROOT)
                        )
                );
            }

            if (request.getEntityId() != null
                    && !request.getEntityId().isBlank()) {

                predicates.add(
                        cb.equal(
                                root.get("entityId"),
                                request.getEntityId().trim()
                        )
                );
            }

            if (request.getAction() != null) {

                predicates.add(
                        cb.equal(
                                root.get("action"),
                                request.getAction()
                        )
                );
            }

            if (request.getPerformedBy() != null) {

                predicates.add(
                        cb.equal(
                                root.get("performedBy"),
                                request.getPerformedBy()
                        )
                );
            }

            if (request.getPerformedByType() != null
                    && !request.getPerformedByType().isBlank()) {

                predicates.add(
                        cb.equal(
                                cb.upper(root.get("performedByType")),
                                request.getPerformedByType()
                                        .trim()
                                        .toUpperCase(Locale.ROOT)
                        )
                );
            }

            if (request.getFromDate() != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("createdAt"),
                                request.getFromDate()
                        )
                );
            }

            if (request.getToDate() != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("createdAt"),
                                request.getToDate()
                        )
                );
            }

            if (request.getKeyword() != null
                    && !request.getKeyword().isBlank()) {

                String keyword =
                        "%" + request.getKeyword()
                                .trim()
                                .toLowerCase(Locale.ROOT) + "%";

                predicates.add(
                        cb.or(
                                cb.like(
                                        cb.lower(root.get("description")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("entityName")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("performedByName")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("entityId")),
                                        keyword
                                )
                        )
                );
            }

            return cb.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }

    /* =====================================================
       PDF EXPORT
    ===================================================== */

    @Override
    public byte[] exportPdf(AuditLogSearchRequest request) {

        List<AuditLogEntity> records =
                getFilteredRecords(request);

        var config =
                AuditLogExportColumnConfig.getConfig(
                        request.getEntityName()
                );

        try (ByteArrayOutputStream output =
                     new ByteArrayOutputStream()) {

            Document document = new Document(
                    PageSize.A4.rotate(),
                    25,
                    25,
                    35,
                    35
            );

            PdfWriter writer =
                    PdfWriter.getInstance(document, output);

            writer.setPageEvent(new PdfPageEventHelper() {

                @Override
                public void onEndPage(
                        PdfWriter writer,
                        Document document
                ) {

                    Font footerFont = new Font(
                            Font.HELVETICA,
                            8,
                            Font.NORMAL,
                            Color.GRAY
                    );

                    Phrase footer = new Phrase(
                            "Audit Report | Page "
                                    + writer.getPageNumber(),
                            footerFont
                    );

                    com.lowagie.text.pdf.ColumnText.showTextAligned(
                            writer.getDirectContent(),
                            Element.ALIGN_CENTER,
                            footer,
                            (document.right() + document.left()) / 2,
                            document.bottom() - 18,
                            0
                    );
                }
            });

            document.open();

            Font titleFont = new Font(
                    Font.HELVETICA,
                    18,
                    Font.BOLD,
                    new Color(46, 54, 77)
            );

            Font subtitleFont = new Font(
                    Font.HELVETICA,
                    9,
                    Font.NORMAL,
                    Color.GRAY
            );

            Font headerFont = new Font(
                    Font.HELVETICA,
                    8,
                    Font.BOLD,
                    Color.WHITE
            );

            Font bodyFont = new Font(
                    Font.HELVETICA,
                    7,
                    Font.NORMAL,
                    Color.DARK_GRAY
            );

            Paragraph title = new Paragraph(
                    config.title(),
                    titleFont
            );

            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(8);

            document.add(title);

            Paragraph metadata = new Paragraph(
                    buildMetadata(request, records.size()),
                    subtitleFont
            );

            metadata.setAlignment(Element.ALIGN_CENTER);
            metadata.setSpacingAfter(15);

            document.add(metadata);

            PdfPTable table = new PdfPTable(
                    config.columns().size()
            );

            table.setWidthPercentage(100);
            table.setHeaderRows(1);

            for (var column : config.columns()) {

                PdfPCell cell = new PdfPCell(
                        new Phrase(column.header(), headerFont)
                );

                cell.setBackgroundColor(
                        new Color(46, 54, 77)
                );

                cell.setPadding(6);
                cell.setHorizontalAlignment(
                        Element.ALIGN_CENTER
                );

                table.addCell(cell);
            }

            for (AuditLogEntity record : records) {

                for (var column : config.columns()) {

                    String value = safe(
                            column.value().apply(record)
                    );

                    PdfPCell cell = new PdfPCell(
                            new Phrase(value, bodyFont)
                    );

                    cell.setPadding(5);
                    cell.setVerticalAlignment(
                            Element.ALIGN_MIDDLE
                    );

                    table.addCell(cell);
                }
            }

            document.add(table);

            if (records.isEmpty()) {

                Paragraph empty = new Paragraph(
                        "No audit records found.",
                        bodyFont
                );

                empty.setSpacingBefore(15);
                empty.setAlignment(Element.ALIGN_CENTER);

                document.add(empty);
            }

            document.close();

            return output.toByteArray();

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Failed to generate audit PDF.",
                    exception
            );
        }
    }

    /* =====================================================
       EXCEL EXPORT
    ===================================================== */

    @Override
    public byte[] exportExcel(AuditLogSearchRequest request) {

        List<AuditLogEntity> records =
                getFilteredRecords(request);

        var config =
                AuditLogExportColumnConfig.getConfig(
                        request.getEntityName()
                );

        try (
                Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream output =
                        new ByteArrayOutputStream()
        ) {

            Sheet sheet = workbook.createSheet(
                    safeSheetName(
                            request.getEntityName() == null
                                    ? "All Activities"
                                    : request.getEntityName()
                    )
            );

            /* =========================================
               TITLE STYLE
            ========================================= */

            CellStyle titleStyle =
                    workbook.createCellStyle();

            org.apache.poi.ss.usermodel.Font titleFont =
                    workbook.createFont();

            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 16);

            titleFont.setColor(
                    IndexedColors.DARK_BLUE.getIndex()
            );

            titleStyle.setFont(titleFont);

           /* =========================================
   HEADER STYLE
========================================= */

            CellStyle headerStyle = workbook.createCellStyle();

            org.apache.poi.ss.usermodel.Font headerFont =
                    workbook.createFont();

            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(
                    IndexedColors.BLUE.getIndex()
            );
            headerStyle.setFillPattern(
                    FillPatternType.SOLID_FOREGROUND
            );

            headerStyle.setAlignment(
                    HorizontalAlignment.CENTER
            );

            headerStyle.setVerticalAlignment(
                    VerticalAlignment.CENTER
            );

            headerStyle.setWrapText(true);

            /* =========================================
               DATA STYLE
            ========================================= */

            CellStyle dataStyle =
                    workbook.createCellStyle();

            dataStyle.setVerticalAlignment(
                    VerticalAlignment.TOP
            );

            dataStyle.setWrapText(true);

            /* =========================================
               REPORT TITLE
            ========================================= */

            Row titleRow = sheet.createRow(0);

            Cell titleCell = titleRow.createCell(0);

            titleCell.setCellValue(config.title());
            titleCell.setCellStyle(titleStyle);

            sheet.addMergedRegion(
                    new org.apache.poi.ss.util.CellRangeAddress(
                            0,
                            0,
                            0,
                            config.columns().size() - 1
                    )
            );

            /* =========================================
               METADATA
            ========================================= */

            Row metadataRow = sheet.createRow(1);

            metadataRow.createCell(0).setCellValue(
                    buildMetadata(request, records.size())
            );

            sheet.addMergedRegion(
                    new org.apache.poi.ss.util.CellRangeAddress(
                            1,
                            1,
                            0,
                            config.columns().size() - 1
                    )
            );

            /* =========================================
               COLUMN HEADERS
            ========================================= */

            int headerRowIndex = 3;

            Row headerRow =
                    sheet.createRow(headerRowIndex);

            for (int i = 0;
                 i < config.columns().size();
                 i++) {

                Cell cell = headerRow.createCell(i);

                cell.setCellValue(
                        config.columns().get(i).header()
                );

                cell.setCellStyle(headerStyle);
            }

            headerRow.setHeightInPoints(30);

            /* =========================================
               DATA ROWS
            ========================================= */

            int rowIndex = headerRowIndex + 1;

            for (AuditLogEntity record : records) {

                Row row = sheet.createRow(rowIndex++);

                for (int i = 0;
                     i < config.columns().size();
                     i++) {

                    Cell cell = row.createCell(i);

                    String value = safe(
                            config.columns()
                                    .get(i)
                                    .value()
                                    .apply(record)
                    );

                    // Export values as text to preserve IDs,
                    // JSON values and leading zeroes.
                    cell.setCellValue(value);

                    cell.setCellStyle(dataStyle);
                }
            }

            /* =========================================
               AUTO WIDTH / FILTER / FREEZE
            ========================================= */

            for (int i = 0;
                 i < config.columns().size();
                 i++) {

                sheet.autoSizeColumn(i);

                sheet.setColumnWidth(
                        i,
                        Math.min(
                                Math.max(
                                        sheet.getColumnWidth(i),
                                        15 * 256
                                ),
                                55 * 256
                        )
                );
            }

            if (!records.isEmpty()) {

                sheet.setAutoFilter(
                        new org.apache.poi.ss.util.CellRangeAddress(
                                headerRowIndex,
                                rowIndex - 1,
                                0,
                                config.columns().size() - 1
                        )
                );
            }

            sheet.createFreezePane(0, headerRowIndex + 1);

            workbook.write(output);

            return output.toByteArray();

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Failed to generate audit Excel.",
                    exception
            );
        }
    }

    /* =====================================================
       CSV EXPORT
    ===================================================== */

    @Override
    public byte[] exportCsv(AuditLogSearchRequest request) {

        List<AuditLogEntity> records =
                getFilteredRecords(request);

        var config =
                AuditLogExportColumnConfig.getConfig(
                        request.getEntityName()
                );

        StringBuilder csv = new StringBuilder();

        // UTF-8 BOM for Excel compatibility.
        csv.append('\uFEFF');

        csv.append(
                csvValue(config.title())
        ).append("\r\n");

        csv.append(
                csvValue(buildMetadata(request, records.size()))
        ).append("\r\n\r\n");

        /* =========================================
           HEADER
        ========================================= */

        for (int i = 0;
             i < config.columns().size();
             i++) {

            if (i > 0) {
                csv.append(",");
            }

            csv.append(
                    csvValue(
                            config.columns().get(i).header()
                    )
            );
        }

        csv.append("\r\n");

        /* =========================================
           DATA
        ========================================= */

        for (AuditLogEntity record : records) {

            for (int i = 0;
                 i < config.columns().size();
                 i++) {

                if (i > 0) {
                    csv.append(",");
                }

                String value = safe(
                        config.columns()
                                .get(i)
                                .value()
                                .apply(record)
                );

                csv.append(csvValue(value));
            }

            csv.append("\r\n");
        }

        return csv.toString().getBytes(
                StandardCharsets.UTF_8
        );
    }

    /* =====================================================
       METADATA
    ===================================================== */

    private String buildMetadata(
            AuditLogSearchRequest request,
            int totalRecords
    ) {

        String module =
                request.getEntityName() == null
                        || request.getEntityName().isBlank()
                        ? "ALL"
                        : request.getEntityName();

        return "Module: " + module
                + " | Records: " + totalRecords
                + " | From: " + safeDate(request.getFromDate())
                + " | To: " + safeDate(request.getToDate())
                + " | Generated: "
                + LocalDateTime.now().format(DATE_FORMAT);
    }

    private String safeDate(LocalDateTime date) {

        return date == null
                ? "All"
                : date.format(DATE_FORMAT);
    }

    private String safe(String value) {

        return value == null ? "" : value;
    }

    private String csvValue(String value) {

        if (value == null) {
            value = "";
        }

        // Protect spreadsheet applications against
        // formula injection from untrusted audit values.
        if (value.matches("^[\\s\\u0000-\\u001F]*[=+@-].*")) {
            value = "'" + value;
        }
        value = value.replace("\"", "\"\"");

        return "\"" + value + "\"";
    }

    private String safeSheetName(String name) {

        String result = name.replaceAll("[\\\\/*?:\\[\\]]", "_");

        return result.length() > 31
                ? result.substring(0, 31)
                : result;
    }
}