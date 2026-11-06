package com.ims.service.impl.reports;


import com.ims.common.PageResponse;
import com.ims.dtos.reports.*;
import com.ims.enums.reports.ReportModule;
import com.ims.repository.reports.ReportRegistry;
import com.ims.service.serviceInterface.reports.ReportService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRegistry registry;

    // =====================================================
    // AVAILABLE MODULES
    // =====================================================

    @Override
    public List<ReportModuleResponse> getModules() {

        return registry.getProviders()
                .entrySet()
                .stream()
                .map(entry -> {

                    ReportModule module = entry.getKey();

                    int reportCount =
                            entry.getValue()
                                    .getReportDefinitions()
                                    .size();

                    return ReportModuleResponse.builder()
                            .module(module)
                            .moduleName(module.getDisplayName())
                            .reportCount(reportCount)
                            .build();
                })
                .toList();
    }

    // =====================================================
    // REPORT CATALOG
    // =====================================================

    @Override
    public ReportCatalogResponse getCatalog(String moduleName) {

        ReportModule module = parseModule(moduleName);

        ReportDataProvider provider =
                registry.getProvider(module);

        return ReportCatalogResponse.builder()
                .module(module)
                .moduleName(module.getDisplayName())
                .reports(provider.getReportDefinitions())
                .build();
    }

    // =====================================================
    // REPORT PREVIEW
    // =====================================================

    @Override
    public ReportPreviewResponse preview(ReportRequest request) {

        validateRequest(request);

        ReportModule module = request.getModule();

        ReportDataProvider provider =
                registry.getProvider(module);

        ReportDefinition definition =
                getDefinition(provider, request.getReportCode());

        Pageable pageable = createPageable(request, definition);

        ReportData data = provider.generate(
                request,
                pageable
        );

        data = applySelectedColumns(data, request);

        List<ReportResponse> rows =
                data.getRows()
                        .stream()
                        .map(row ->
                                ReportResponse.builder()
                                        .values(row)
                                        .build()
                        )
                        .toList();

        PageResponse<ReportResponse> pageResponse =
                PageResponse.<ReportResponse>builder()
                        .content(rows)
                        .pageNumber(data.getPageNumber())
                        .pageSize(data.getPageSize())
                        .totalElements(data.getTotalElements())
                        .totalPages(data.getTotalPages())
                        .last(data.isLast())
                        .build();

        return ReportPreviewResponse.builder()
                .module(module)
                .reportCode(definition.getCode())
                .reportName(definition.getName())
                .columns(data.getColumns())
                .rows(pageResponse)
                .summary(data.getSummary())
                .build();
    }

    // =====================================================
    // GENERATE ALL DATA FOR EXPORT
    // =====================================================

    @Override
    public ReportData generateAll(ReportRequest request) {

        validateRequest(request);

        ReportDataProvider provider =
                registry.getProvider(request.getModule());

        ReportDefinition definition =
                getDefinition(provider, request.getReportCode());

        // Export ignores preview pagination.
        ReportData data = provider.generate(
                request,
                Pageable.unpaged()
        );

        return applySelectedColumns(data, request);
    }

    // =====================================================
    // VALIDATION
    // =====================================================

    private void validateRequest(ReportRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Report request is required."
            );
        }

        if (request.getModule() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Report module is required."
            );
        }

        if (request.getReportCode() == null
                || request.getReportCode().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Report code is required."
            );
        }

        if (request.getPage() < 0 || request.getSize() < 1
                || request.getSize() > 500) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid pagination values."
            );
        }

        if (request.getFilters() == null) {
            request.setFilters(new ReportFilterRequest());
        }

        if (request.getFilters().getFromDate() != null
                && request.getFilters().getToDate() != null
                && request.getFilters().getFromDate()
                .isAfter(request.getFilters().getToDate())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "From date cannot be after to date."
            );
        }
    }

    // =====================================================
    // MODULE PARSING
    // =====================================================

    private ReportModule parseModule(String value) {

        try {
            return ReportModule.fromValue(value);

        } catch (IllegalArgumentException exception) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid report module: " + value
            );
        }
    }

    // =====================================================
    // REPORT DEFINITION
    // =====================================================

    private ReportDefinition getDefinition(
            ReportDataProvider provider,
            String reportCode) {

        return provider.getReportDefinitions()
                .stream()
                .filter(definition ->
                        definition.getCode()
                                .equalsIgnoreCase(reportCode)
                )
                .findFirst()
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Report not found: " + reportCode
                        )
                );
    }

    // =====================================================
    // PAGINATION AND SORTING
    // =====================================================

    private Pageable createPageable(
            ReportRequest request,
            ReportDefinition definition) {

        if (request.getSize() > 500) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Maximum page size is 500."
            );
        }

        Sort sort = Sort.unsorted();

        if (request.getSortBy() != null
                && !request.getSortBy().isBlank()) {

            boolean validColumn =
                    definition.getColumns()
                            .stream()
                            .anyMatch(column ->
                                    column.getKey().equals(
                                            request.getSortBy()
                                    )
                            );

            if (!validColumn) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid report sort column."
                );
            }

            String direction =
                    request.getSortDirection() == null
                            ? "ASC"
                            : request.getSortDirection();

            Sort.Direction sortDirection;

            try {
                sortDirection = Sort.Direction.fromString(direction);
            } catch (IllegalArgumentException exception) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Sort direction must be ASC or DESC."
                );
            }

            sort = Sort.by(
                    sortDirection,
                    request.getSortBy()
            );
        }

        return PageRequest.of(
                request.getPage(),
                request.getSize(),
                sort
        );
    }

    // =====================================================
    // SELECTED REPORT COLUMNS
    // =====================================================

    private ReportData applySelectedColumns(
            ReportData data,
            ReportRequest request) {

        if (data == null) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Report provider returned empty data."
            );
        }

        List<ReportColumn> availableColumns =
                data.getColumns() == null
                        ? new ArrayList<>()
                        : data.getColumns();

        List<String> selectedKeys =
                request.getColumns() == null
                        ? new ArrayList<>()
                        : request.getColumns();

        List<ReportColumn> selectedColumns;

        if (selectedKeys.isEmpty()) {

            selectedColumns = availableColumns.stream()
                    .filter(ReportColumn::isDefaultVisible)
                    .toList();

        } else {

            Set<String> requestedKeys =
                    selectedKeys.stream()
                            .collect(Collectors.toSet());

            selectedColumns = availableColumns.stream()
                    .filter(column ->
                            requestedKeys.contains(column.getKey())
                    )
                    .toList();

            if (selectedColumns.size() != requestedKeys.size()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "One or more selected report columns are invalid."
                );
            }
        }

        List<Map<String, Object>> filteredRows =
                data.getRows() == null
                        ? new ArrayList<>()
                        : data.getRows()
                        .stream()
                        .map(row -> {

                            Map<String, Object> filtered =
                            new LinkedHashMap<>();

                            for (ReportColumn column : selectedColumns) {
                                filtered.put(
                                        column.getKey(),
                                        row.get(column.getKey())
                                );
                            }

                            return filtered;
                        })
                        .toList();

        data.setColumns(selectedColumns);
        data.setRows(filteredRows);

        return data;
    }
}