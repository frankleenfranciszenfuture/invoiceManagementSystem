package com.ims.dtos.audit.enityAuditSnapShot;


import com.ims.enums.Status;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubCategoryAuditSnapshot {

    private Long id;

    private String subCategoryCode;

    private String name;

    private String description;

    private Long categoryId;

    private String categoryCode;

    private String categoryName;

    private Integer displayOrder;

    private Status status;

    private Boolean active;
}

