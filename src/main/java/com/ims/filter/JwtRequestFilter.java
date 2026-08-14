package com.ims.filter;

import com.ims.service.impl.common.AppUserDetailsService;
import com.ims.utils.jwt.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtRequestFilter extends OncePerRequestFilter {

    private final AppUserDetailsService appUserDetailsService;
    private final JwtUtil jwtUtil;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getServletPath();

        return path.equals("/login")
                || path.equals("/register")
                || path.equals("/send-reset-otp")
                || path.equals("/reset-password")
                || path.equals("/logout")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.equals("/swagger-ui.html")
                || path.startsWith("/webjars");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String jwt = extractToken(request);

        if (jwt == null || jwt.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {

            String email = jwtUtil.extractEmail(jwt);

            if (email != null
                    && SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                UserDetails userDetails =
                        appUserDetailsService
                                .loadUserByUsername(email);

                if (jwtUtil.validateToken(jwt, userDetails)) {

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);
                }
            }

        } catch (UsernameNotFoundException ex) {

            SecurityContextHolder.clearContext();

            System.out.println(
                    "User not found for JWT: "
                            + ex.getMessage()
            );

        } catch (Exception ex) {

            SecurityContextHolder.clearContext();

            System.out.println(
                    "JWT validation failed: "
                            + ex.getMessage()
            );
        }

        filterChain.doFilter(request, response);
    }

    /**
     * JWT priority:
     * 1. Authorization header
     * 2. jwt HttpOnly cookie
     */
    private String extractToken(HttpServletRequest request) {

        // 1. Authorization Header
        String authorizationHeader =
                request.getHeader("Authorization");

        if (authorizationHeader != null
                && authorizationHeader.startsWith("Bearer ")) {

            String token =
                    authorizationHeader.substring(7).trim();

            if (!token.isBlank()) {
                return token;
            }
        }

        // 2. JWT Cookie
        Cookie[] cookies = request.getCookies();

        if (cookies != null) {

            for (Cookie cookie : cookies) {

                if ("jwt".equals(cookie.getName())) {

                    String token = cookie.getValue();

                    if (token != null
                            && !token.isBlank()) {

                        return token;
                    }
                }
            }
        }

        return null;
    }
}