package com.ims.dtos.emailSignature;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailSignatureDefaultRequest {

    @NotNull(message = "Default setting is required")
    private Boolean enabled;
}