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
public class SizeAuditSnapshot {

    private Long id;

    private String sizeCode;

    private String sizeName;

    private String sizeShortName;

    private String description;

    private Status status;

    private Integer displayOrder;

    private Long productId;

    private String productName;

    private Boolean active;
}
