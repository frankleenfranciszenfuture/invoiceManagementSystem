package com.ims.dtos.emailSignature;


import com.ims.enums.CurrencyStatus;
import com.ims.enums.EmailSignatureStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailSignatureCreateRequest {

    @NotBlank(message = "Signature name is required")
    @Size(max = 150, message = "Signature name cannot exceed 150 characters")
    private String signatureName;

    @NotBlank(message = "Signature content is required")
    private String signatureContent;

    private Boolean defaultForNewMessages;

    private Boolean defaultForReplies;

    // =====================================================
    // STATUS
    // =====================================================


    private EmailSignatureStatus status;

}
