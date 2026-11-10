package com.ims.dtos.audit.enityAuditSnapShot;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.ims.enums.Status;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleAuditSnapshot {

    private Long id;

    private String roleName;

    private String description;

    private Status status;

    private Boolean active;
}
