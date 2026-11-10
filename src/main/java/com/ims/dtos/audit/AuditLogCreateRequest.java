package com.ims.dtos.audit;

import com.ims.enums.audit.AuditAction;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogCreateRequest {

    private String entityName;

    private String entityId;

    private AuditAction action;

    private String description;

    private String oldValue;

    private String newValue;

    private Long performedBy;

    private String performedByName;

    private String performedByType;

    private String ipAddress;

    private String moduleName;
}
