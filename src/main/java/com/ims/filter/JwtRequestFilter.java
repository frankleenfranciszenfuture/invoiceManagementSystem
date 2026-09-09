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

    /*
     * =========================================================
     * SKIP JWT FILTER
     * =========================================================
     *
     * These endpoints do not require JWT authentication.
     *
     * IMPORTANT:
     * /is-authenticated is NOT included here.
     *
     * It must pass through this filter so that Spring Security
     * can determine whether the JWT cookie is valid.
     */
    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request) {

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

    /*
     * =========================================================
     * JWT FILTER
     * =========================================================
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        /*
         * If Spring Security already has an authenticated user,
         * there is nothing more to do.
         */
        if (SecurityContextHolder
                .getContext()
                .getAuthentication() != null) {

            filterChain.doFilter(request, response);
            return;
        }

        /*
         * Extract JWT.
         *
         * Priority:
         * 1. Authorization header
         * 2. HttpOnly jwt cookie
         */
        String jwt = extractToken(request);

        /*
         * No JWT.
         *
         * Continue the request and let Spring Security decide
         * whether the endpoint is public or requires authentication.
         */
        if (jwt == null || jwt.isBlank()) {

            System.out.println(
                    "🔐 No JWT found for: "
                            + request.getServletPath()
            );

            filterChain.doFilter(request, response);
            return;
        }

        try {

            /*
             * =================================================
             * EXTRACT EMAIL
             * =================================================
             */
            String email =
                    jwtUtil.extractEmail(jwt);

            if (email == null || email.isBlank()) {

                System.out.println(
                        "❌ JWT does not contain email"
                );

                filterChain.doFilter(request, response);
                return;
            }

            /*
             * =================================================
             * LOAD USER
             * =================================================
             */
            UserDetails userDetails =
                    appUserDetailsService
                            .loadUserByUsername(email);

            /*
             * =================================================
             * VALIDATE JWT
             * =================================================
             */
            if (jwtUtil.validateToken(
                    jwt,
                    userDetails)) {

                /*
                 * =================================================
                 * CREATE AUTHENTICATION
                 * =================================================
                 */
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

                /*
                 * =================================================
                 * SET SECURITY CONTEXT
                 * =================================================
                 */
                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);

                System.out.println(
                        "✅ JWT authenticated: "
                                + email
                );

            } else {

                System.out.println(
                        "❌ JWT validation failed for: "
                                + email
                );

                SecurityContextHolder.clearContext();
            }

        } catch (UsernameNotFoundException ex) {

            SecurityContextHolder.clearContext();

            System.out.println(
                    "❌ User not found for JWT: "
                            + ex.getMessage()
            );

        } catch (Exception ex) {

            SecurityContextHolder.clearContext();

            System.out.println(
                    "❌ JWT processing failed: "
                            + ex.getMessage()
            );
        }

        /*
         * Continue request.
         */
        filterChain.doFilter(request, response);
    }

    /*
     * =========================================================
     * EXTRACT JWT
     * =========================================================
     *
     * Priority:
     *
     * 1. Authorization header
     * 2. jwt HttpOnly cookie
     *
     * The current frontend uses the HttpOnly cookie.
     * Authorization support is retained for compatibility.
     */
    private String extractToken(
            HttpServletRequest request) {

        /*
         * =====================================================
         * 1. AUTHORIZATION HEADER
         * =====================================================
         */
        String authorizationHeader =
                request.getHeader("Authorization");

        if (authorizationHeader != null
                && authorizationHeader.startsWith("Bearer ")) {

            String token =
                    authorizationHeader
                            .substring(7)
                            .trim();

            if (!token.isBlank()) {

                System.out.println(
                        "🔑 JWT found in Authorization header"
                );

                return token;
            }
        }

        /*
         * =====================================================
         * 2. JWT COOKIE
         * =====================================================
         */
        Cookie[] cookies =
                request.getCookies();

        if (cookies != null) {

            for (Cookie cookie : cookies) {

                if ("jwt".equals(cookie.getName())) {

                    String token =
                            cookie.getValue();

                    if (token != null
                            && !token.isBlank()) {

                        System.out.println(
                                "🍪 JWT found in HttpOnly cookie"
                        );

                        return token;
                    }
                }
            }
        }

        /*
         * =====================================================
         * NO JWT
         * =====================================================
         */
        return null;
    }
}