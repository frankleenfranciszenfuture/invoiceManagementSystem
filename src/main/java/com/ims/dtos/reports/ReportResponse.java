package com.ims.dtos.reports;


import lombok.*;

import java.util.LinkedHashMap;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {

    @Builder.Default
    private Map<String, Object> values =
            new LinkedHashMap<>();

}