package com.ims.dtos.reports;


import lombok.*;

import java.util.LinkedHashMap;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportSummaryResponse {

    @Builder.Default
    private Map<String, Object> metrics =
            new LinkedHashMap<>();

}