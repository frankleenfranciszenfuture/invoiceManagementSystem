package com.ims.dtos.dashbaord;



import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PendingApprovalResponse {

    private Long id;

    private String referenceNumber;

    private String requesterName;

    private String requesterEmail;

    private String approvalType;

    private String status;

    private LocalDateTime requestedAt;
}

