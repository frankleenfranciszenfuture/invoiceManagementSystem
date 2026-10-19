package com.ims.dtos.emailSignature;

import com.ims.enums.CurrencyStatus;
import com.ims.enums.EmailSignatureStatus;
import jakarta.validation.constraints.NotNull;
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

    private EmailSignatureStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}