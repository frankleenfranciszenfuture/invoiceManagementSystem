package com.ims.service.impl.reports;

import com.ims.dtos.reports.ReportColumn;
import com.ims.dtos.reports.ReportData;
import com.ims.dtos.reports.ReportRequest;
import com.ims.service.serviceInterface.reports.ReportExportService;
import com.ims.service.serviceInterface.reports.ReportService;
import lombok.RequiredArgsConstructor;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportExportServiceImpl implements ReportExportService {

    private final ReportService reportService;

    // =====================================================
    // PDF EXPORT
    // =====================================================

    @Override
    public byte[] exportPdf(ReportRequest request) {

        ReportData data = reportService.generateAll(request);

        String title = request.getModule().getDisplayName()
                + " - "
                + request.getReportCode();

        List<String> lines = new ArrayList<>();

        lines.add(title);
        lines.add("Generated: " + LocalDateTime.now());
        lines.add("Total Records: " + data.getTotalElements());
        lines.add("----------------------------------------------");
        lines.add("");

        for (Map<String, Object> row : data.getRows()) {

            StringBuilder line = new StringBuilder();

            for (ReportColumn column : data.getColumns()) {

                if (!line.isEmpty()) {
                    line.append(" | ");
                }

                line.append(column.getLabel())
                        .append(": ")
                        .append(formatValue(
                                row.get(column.getKey())
                        ));
            }

            lines.add(line.toString());
            lines.add("");
        }

        if (data.getRows().isEmpty()) {
            lines.add("No records found.");
        }

        return createPdf(lines);
    }

    private byte[] createPdf(List<String> lines) {

        try (
                PDDocument document = new PDDocument();
                ByteArrayOutputStream output =
                        new ByteArrayOutputStream()
        ) {

            PDType1Font font = new PDType1Font(
                    Standard14Fonts.FontName.HELVETICA
            );

            PDType1Font boldFont = new PDType1Font(
                    Standard14Fonts.FontName.HELVETICA_BOLD
            );

            int linesPerPage = 50;

            for (int start = 0;
                 start < lines.size();
                 start += linesPerPage) {

                PDPage page = new PDPage(PDRectangle.A4);

                document.addPage(page);

                try (PDPageContentStream stream =
                             new PDPageContentStream(document, page)) {

                    stream.beginText();

                    stream.setFont(boldFont, 13);

                    stream.newLineAtOffset(40, 800);

                    int end = Math.min(
                            start + linesPerPage,
                            lines.size()
                    );

                    for (int i = start; i < end; i++) {

                        String line = sanitizePdfText(
                                lines.get(i)
                        );

                        stream.setFont(
                                i == start ? boldFont : font,
                                i == start ? 13 : 8
                        );

                        stream.showText(
                                truncate(line, 125)
                        );

                        stream.newLineAtOffset(0, -14);
                    }

                    stream.endText();
                }
            }

            document.save(output);

            return output.toByteArray();

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Failed to generate PDF report.",
                    exception
            );
        }
    }

    private String sanitizePdfText(String value) {

        if (value == null) {
            return "";
        }

        // Standard Helvetica supports WinAnsi characters.
        return value.replaceAll("[^\\x20-\\xFF]", "?");
    }

    // =====================================================
    // EXCEL EXPORT
    // =====================================================

    @Override
    public byte[] exportExcel(ReportRequest request) {

        ReportData data = reportService.generateAll(request);

        try (
                XSSFWorkbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream output =
                        new ByteArrayOutputStream()
        ) {

            Sheet sheet = workbook.createSheet("Report");

            CellStyle headerStyle = workbook.createCellStyle();

            Font headerFont = workbook.createFont();

            headerFont.setBold(true);

            headerStyle.setFont(headerFont);

            headerStyle.setFillForegroundColor(
                    IndexedColors.GREY_25_PERCENT.getIndex()
            );

            headerStyle.setFillPattern(
                    FillPatternType.SOLID_FOREGROUND
            );

            // Header
            Row header = sheet.createRow(0);

            for (int i = 0; i < data.getColumns().size(); i++) {

                Cell cell = header.createCell(i);

                cell.setCellValue(
                        data.getColumns().get(i).getLabel()
                );

                cell.setCellStyle(headerStyle);
            }

            // Data
            int rowIndex = 1;

            for (Map<String, Object> reportRow : data.getRows()) {

                Row row = sheet.createRow(rowIndex++);

                for (int i = 0; i < data.getColumns().size(); i++) {

                    ReportColumn column = data.getColumns().get(i);

                    Object value = reportRow.get(column.getKey());

                    Cell cell = row.createCell(i);

                    setExcelCellValue(cell, value);
                }
            }

            for (int i = 0; i < data.getColumns().size(); i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(output);

            return output.toByteArray();

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Failed to generate Excel report.",
                    exception
            );
        }
    }

    private void setExcelCellValue(Cell cell, Object value) {

        if (value == null) {
            cell.setBlank();
            return;
        }

        if (value instanceof BigDecimal decimal) {
            cell.setCellValue(decimal.doubleValue());
            return;
        }

        if (value instanceof Number number) {
            cell.setCellValue(number.doubleValue());
            return;
        }

        if (value instanceof Boolean bool) {
            cell.setCellValue(bool);
            return;
        }

        cell.setCellValue(formatValue(value));
    }

    // =====================================================
    // CSV EXPORT
    // =====================================================

    @Override
    public byte[] exportCsv(ReportRequest request) {

        ReportData data = reportService.generateAll(request);

        StringBuilder csv = new StringBuilder();

        // UTF-8 BOM for spreadsheet compatibility.
        csv.append('\uFEFF');

        // Header
        for (int i = 0; i < data.getColumns().size(); i++) {

            if (i > 0) {
                csv.append(',');
            }

            csv.append(escapeCsv(
                    data.getColumns().get(i).getLabel()
            ));
        }

        csv.append("\r\n");

        // Rows
        for (Map<String, Object> row : data.getRows()) {

            for (int i = 0; i < data.getColumns().size(); i++) {

                if (i > 0) {
                    csv.append(',');
                }

                ReportColumn column = data.getColumns().get(i);

                csv.append(escapeCsv(
                        formatValue(
                                row.get(column.getKey())
                        )
                ));
            }

            csv.append("\r\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String value) {

        if (value == null) {
            return "";
        }

        return "\""
                + value.replace("\"", "\"\"")
                + "\"";
    }

    // =====================================================
    // PRINT EXPORT
    // =====================================================

    @Override
    public String exportPrint(ReportRequest request) {

        ReportData data = reportService.generateAll(request);

        StringBuilder html = new StringBuilder();

        String title = request.getModule().getDisplayName()
                + " - "
                + request.getReportCode();

        html.append("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>%s</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 25px;
                            color: #222;
                        }

                        h2 {
                            text-align: center;
                            margin-bottom: 5px;
                        }

                        .generated {
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                            margin-bottom: 20px;
                        }

                        table {
                            width: 100%%;
                            border-collapse: collapse;
                            font-size: 11px;
                        }

                        th, td {
                            border: 1px solid #ddd;
                            padding: 7px;
                            text-align: left;
                        }

                        th {
                            background: #f1f5f9;
                        }

                        tr {
                            page-break-inside: avoid;
                        }

                        @media print {
                            body {
                                padding: 0;
                            }

                            @page {
                                size: landscape;
                                margin: 10mm;
                            }
                        }
                    </style>
                </head>
                <body>
                """.formatted(escapeHtml(title)));

        html.append("<h2>")
                .append(escapeHtml(title))
                .append("</h2>");

        html.append("<div class='generated'>")
                .append("Generated: ")
                .append(LocalDateTime.now())
                .append(" | Total Records: ")
                .append(data.getTotalElements())
                .append("</div>");

        html.append("<table><thead><tr>");

        for (ReportColumn column : data.getColumns()) {

            html.append("<th>")
                    .append(escapeHtml(column.getLabel()))
                    .append("</th>");
        }

        html.append("</tr></thead><tbody>");

        for (Map<String, Object> row : data.getRows()) {

            html.append("<tr>");

            for (ReportColumn column : data.getColumns()) {

                html.append("<td>")
                        .append(escapeHtml(
                                formatValue(
                                        row.get(column.getKey())
                                )
                        ))
                        .append("</td>");
            }

            html.append("</tr>");
        }

        if (data.getRows().isEmpty()) {

            html.append("<tr><td colspan='")
                    .append(data.getColumns().size())
                    .append("'>No records found.</td></tr>");
        }

        html.append("</tbody></table>");

        html.append("""
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
                </body>
                </html>
                """);

        return html.toString();
    }

    // =====================================================
    // COMMON HELPERS
    // =====================================================

    private String formatValue(Object value) {

        if (value == null) {
            return "";
        }

        if (value instanceof LocalDate date) {
            return date.toString();
        }

        if (value instanceof LocalDateTime dateTime) {
            return dateTime.toString();
        }

        if (value instanceof BigDecimal decimal) {
            return decimal.toPlainString();
        }

        return String.valueOf(value);
    }

    private String escapeHtml(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String truncate(String value, int maxLength) {

        if (value == null || value.length() <= maxLength) {
            return value == null ? "" : value;
        }

        return value.substring(0, maxLength);
    }
}
