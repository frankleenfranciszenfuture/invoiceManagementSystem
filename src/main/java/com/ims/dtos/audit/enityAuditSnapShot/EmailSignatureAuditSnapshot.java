package com.ims.dtos.audit.enityAuditSnapShot;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailSignatureAuditSnapshot {

    private Long id;

    private Long userId;

    private String signatureName;

    private String signatureContent;

    private boolean defaultForNewMessages;

    private boolean defaultForReplies;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Boolean active;
}
