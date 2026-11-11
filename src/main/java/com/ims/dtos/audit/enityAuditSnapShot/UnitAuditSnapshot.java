package com.ims.dtos.audit.enityAuditSnapShot;

import com.ims.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnitAuditSnapshot {

    private Long id;

    private String unitCode;

    private String unitName;

    private String unitShortName;

    private String description;

    private Status status;

    private Long productId;

    private String productName;

    private Boolean active;
}