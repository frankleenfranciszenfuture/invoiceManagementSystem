package com.ims.dtos.reports;

import com.ims.enums.reports.ReportType;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDefinition {

    private String code;

    private String name;

    private String description;

    private ReportType type;

    @Builder.Default
    private List<ReportColumn> columns =
            new ArrayList<>();

}
