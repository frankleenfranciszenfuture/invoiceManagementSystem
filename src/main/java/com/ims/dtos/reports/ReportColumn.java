package com.ims.dtos.reports;


import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportColumn {

    private String key;

    private String label;

    private String dataType;

    @Builder.Default
    private boolean defaultVisible = true;

}