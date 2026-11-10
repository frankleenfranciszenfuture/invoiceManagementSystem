package com.ims.dtos.audit;


import com.ims.dtos.common.BaseResponse;

import com.ims.enums.audit.AuditAction;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse extends BaseResponse {

    private Long id;

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

