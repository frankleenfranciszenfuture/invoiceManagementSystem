package com.ims.dtos.reports;


import lombok.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportData {

    @Builder.Default
    private List<ReportColumn> columns =
            new ArrayList<>();

    @Builder.Default
    private List<Map<String, Object>> rows =
            new ArrayList<>();

    private long totalElements;

    private int pageNumber;

    private int pageSize;

    private int totalPages;

    private boolean last;

    private ReportSummaryResponse summary;

}