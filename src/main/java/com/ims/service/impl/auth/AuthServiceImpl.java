package com.ims.service.impl.auth;


import com.ims.common.ApiResponse;
import com.ims.dtos.auth.AuthRequest;
import com.ims.dtos.auth.AuthResponse;
import com.ims.dtos.user.ResetPasswordRequest;
import com.ims.entity.UserEntity;
import com.ims.repository.UserRepository;
import com.ims.service.serviceInterface.auth.AuthService;
import com.ims.service.serviceInterface.email.EmailService;
import com.ims.service.serviceInterface.profile.ProfileService;
import com.ims.utils.jwt.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final ProfileService profileService;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<AuthResponse>> login(AuthRequest request) {

        try {

            authenticate(request.getEmail(), request.getPassword());
            UserEntity user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String jwtToken = jwtUtil.generateUserToken(user);

            ResponseCookie cookie = ResponseCookie.from("jwt", jwtToken)
                    .httpOnly(true)
                    .secure(false)           // true in production (HTTPS)
                    .path("/")
                    .maxAge(Duration.ofDays(1))
                    .sameSite("Strict")
                    .build();

            AuthResponse response = AuthResponse.builder()

                    .name(user.getName())
                    .email(user.getEmail())
                    .token(jwtToken)
                    .tokenType("Bearer")
                    .build();

            ApiResponse<AuthResponse> apiResponse = ApiResponse.success(
                    response,
                    "Login successful."
            );

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(apiResponse);

        } catch (BadCredentialsException ex) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<AuthResponse>builder()
                            .success(false)
                            .message("Email or Password Incorrect.")
                            .build());

        } catch (DisabledException ex) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<AuthResponse>builder()
                            .success(false)
                            .message("Account is disabled.")
                            .build());

        } catch (Exception ex) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<AuthResponse>builder()
                            .success(false)
                            .message("Authentication failed.")
                            .build());
        }
    }

    private void authenticate(String email, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );
    }

    @Override
    public ResponseEntity<Boolean> isAuthenticated(String email) {
        return ResponseEntity.ok(email != null);
    }

    @Override
    public void sendResetOtp(String email) {
        profileService.sendResetOtp(email);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        profileService.resetPassword(
                request.getEmail(),
                request.getOtp(),
                request.getNewPassword()
        );
    }

    @Override
    public void sendVerifiedOtp(String email) {
        profileService.sendOtp(email);
    }

    @Override
    public void verifyOtp(Map<String, Object> request, String email) {

        if (request.get("otp") == null) {
            throw new RuntimeException("Missing details");
        }

        profileService.verifyOtp(email, request.get("otp").toString());
    }

    @Override
    public ResponseEntity<?> logout(HttpServletResponse response) {

        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Logged out successfully");
    }
}