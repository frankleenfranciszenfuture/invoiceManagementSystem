package com.ims.dtos.audit.enityAuditSnapShot;


import com.ims.enums.Status;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryAuditSnapshot {

    private Long id;

    private String categoryCode;

    private String categoryName;

    private String description;

    private Status status;

    private Boolean active;
}

