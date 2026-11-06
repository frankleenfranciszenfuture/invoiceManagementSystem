package com.ims.dtos.reports;



import com.ims.enums.reports.ReportModule;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportCatalogResponse {

    private ReportModule module;

    private String moduleName;

    private List<ReportDefinition> reports;

}