package com.ims.dtos.audit.enityAuditSnapShot;


import com.ims.enums.SalesPersonType;
import com.ims.enums.Status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesPersonAuditSnapshot {

    private Long id;

    private String salesPersonCode;

    private SalesPersonType salesPersonType;

    private String salesPersonName;

    private String email;

    private String mobile;

    private Status status;

    private Boolean active;
}
