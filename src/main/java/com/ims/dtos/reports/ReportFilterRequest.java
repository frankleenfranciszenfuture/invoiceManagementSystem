package com.ims.dtos.reports;

import lombok.*;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportFilterRequest {

    private String keyword;

    private LocalDate fromDate;

    private LocalDate toDate;

    private String status;

    @Builder.Default
    private Map<String, Object> filters =
            new LinkedHashMap<>();

}
