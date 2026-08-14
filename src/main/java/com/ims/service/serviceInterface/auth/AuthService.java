package com.ims.service.serviceInterface.auth;


import com.ims.common.ApiResponse;
import com.ims.dtos.auth.AuthRequest;
import com.ims.dtos.auth.AuthResponse;
import com.ims.dtos.user.ResetPasswordRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface AuthService {

    ResponseEntity<ApiResponse<AuthResponse>> login(AuthRequest request);

    ResponseEntity<Boolean> isAuthenticated(String email);

    void sendResetOtp(String email);

    void resetPassword(ResetPasswordRequest request);

    void sendVerifiedOtp(String email);

    void verifyOtp(Map<String, Object> request, String email);

    ResponseEntity<?> logout(HttpServletResponse response);
}
