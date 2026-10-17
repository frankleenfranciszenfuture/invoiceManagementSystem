package com.ims.dtos.emailSignature;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailSignatureResponse {

    private Long id;
    private Long userId;
    private String signatureName;
    private String signatureContent;
    private boolean defaultForNewMessages;
    private boolean defaultForReplies;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}