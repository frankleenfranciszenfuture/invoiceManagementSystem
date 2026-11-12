package com.ims.config.websocket;


import com.ims.entity.UserEntity;
import com.ims.repository.UserRepository;
import com.ims.service.impl.common.AppUserDetailsService;
import com.ims.utils.jwt.JwtUtil;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import lombok.RequiredArgsConstructor;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;

import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.stereotype.Component;

import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class NotificationHandshakeInterceptor
        implements HandshakeInterceptor {

    public static final String AUTHENTICATED_USER_ID =
            "authenticatedUserId";

    private static final String JWT_COOKIE_NAME = "jwt";

    private final JwtUtil jwtUtil;

    private final AppUserDetailsService appUserDetailsService;

    private final UserRepository userRepository;


    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {

        try {

            if (!(request instanceof ServletServerHttpRequest servletRequest)) {
                return false;
            }

            HttpServletRequest httpRequest =
                    servletRequest.getServletRequest();

            String token = extractToken(httpRequest);

            if (token == null || token.isBlank()) {
                return false;
            }

            /*
             * Notification connections are USER-only.
             */
            String loginType = jwtUtil.extractLoginType(token);

            if (loginType == null
                    || !"USER".equalsIgnoreCase(loginType)) {
                return false;
            }

            String email = jwtUtil.extractEmail(token);

            Long userId = jwtUtil.extractUserId(token);

            if (email == null || email.isBlank()
                    || userId == null || userId <= 0) {
                return false;
            }

            /*
             * Load the same UserDetails used by JwtRequestFilter.
             */
            UserDetails userDetails =
                    appUserDetailsService.loadUserByUsername(email);

            if (userDetails == null
                    || !jwtUtil.validateToken(token, userDetails)) {
                return false;
            }

            /*
             * Verify that the token's user ID really belongs
             * to the authenticated account.
             */
            UserEntity user = userRepository.findById(userId)
                    .orElse(null);

            if (user == null
                    || !Boolean.TRUE.equals(user.getActive())
                    || !email.equalsIgnoreCase(user.getEmail())) {
                return false;
            }

            /*
             * Store only the verified database user ID.
             * Never trust a user ID supplied by the frontend.
             */
            attributes.put(
                    AUTHENTICATED_USER_ID,
                    userId
            );

            return true;

        } catch (Exception exception) {

            /*
             * Never log the JWT or Authorization header.
             */
            return false;
        }
    }


    private String extractToken(HttpServletRequest request) {

        String authorization =
                request.getHeader("Authorization");

        if (authorization != null
                && authorization.startsWith("Bearer ")) {

            return authorization.substring(7).trim();
        }

        Cookie[] cookies = request.getCookies();

        if (cookies != null) {

            for (Cookie cookie : cookies) {

                if (JWT_COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        return null;
    }


    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception
    ) {
        // No post-handshake processing required.
    }
}
