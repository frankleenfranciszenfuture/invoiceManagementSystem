package com.ims.dtos.user;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResetPasswordRequest {

    @NotBlank(message = "New password is required")
    private String newPassword;

    @NotBlank(message = "OTP is required")
    private String email;

    @NotBlank(message = "Email is required")
    private String otp;
}