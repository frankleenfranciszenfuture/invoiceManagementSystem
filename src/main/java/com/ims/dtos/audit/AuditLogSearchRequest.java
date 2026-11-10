package com.ims.dtos.audit;


import com.ims.enums.audit.AuditAction;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogSearchRequest {

    private String entityName;

    private String entityId;

    private AuditAction action;

    private Long performedBy;

    private String performedByType;

    private String keyword;

    private LocalDateTime fromDate;

    private LocalDateTime toDate;

    @Builder.Default
    private Integer page = 0;

    @Builder.Default
    private Integer size = 10;

    @Builder.Default
    private String sortBy = "createdAt";

    @Builder.Default
    private String sortDirection = "DESC";
}
