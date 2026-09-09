package com.ims.service.impl.common;

import com.ims.config.CurrentSession;
import com.ims.exception.ValidationException;
import com.ims.service.serviceInterface.common.CurrentSessionService;
import com.ims.utils.jwt.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentSessionServiceImpl implements CurrentSessionService {

    private final HttpServletRequest request;
    private final JwtUtil jwtUtil;

    @Override
    public CurrentSession getCurrentSession() {

        String token = extractToken(request);

        if (token == null || token.isBlank()) {
            throw new ValidationException("Missing JWT token");
        }

        try {

            String type = jwtUtil.extractLoginType(token);

            if (type == null || type.isBlank()) {
                throw new ValidationException("Missing login type");
            }

            CurrentSession.LoginType loginType =
                    CurrentSession.LoginType.valueOf(type);

            CurrentSession.CurrentSessionBuilder builder =
                    CurrentSession.builder()
                            .loginType(loginType)
                            .username(jwtUtil.extractEmail(token))
                            .role(jwtUtil.extractRole(token));

            /*
             * USER LOGIN
             */
            if (loginType == CurrentSession.LoginType.USER) {

                builder.userId(
                        jwtUtil.extractUserId(token)
                );
            }

            /*
             * EMPLOYEE LOGIN
             */
            if (loginType == CurrentSession.LoginType.EMPLOYEE) {

                builder.employeeId(
                        jwtUtil.extractEmployeeId(token)
                );
            }

            return builder.build();

        } catch (ValidationException ex) {

            throw ex;

        } catch (Exception ex) {

            ex.printStackTrace();

            throw new ValidationException(
                    "Invalid JWT token"
            );
        }
    }

    /**
     * JWT priority:
     *
     * 1. Authorization header
     * 2. HttpOnly jwt cookie
     */
    private String extractToken(HttpServletRequest request) {

        /*
         * ================================
         * 1. Authorization Header
         * ================================
         */
        String authorizationHeader =
                request.getHeader("Authorization");

        System.out.println(
                "Authorization Header = "
                        + authorizationHeader
        );

        if (authorizationHeader != null
                && authorizationHeader.startsWith("Bearer ")) {

            String token =
                    authorizationHeader
                            .substring(7)
                            .trim();

            if (!token.isBlank()) {

                System.out.println(
                        "JWT found in Authorization header"
                );

                return token;
            }
        }

        /*
         * ================================
         * 2. JWT Cookie
         * ================================
         */
        Cookie[] cookies = request.getCookies();

        if (cookies != null) {

            for (Cookie cookie : cookies) {

                System.out.println(
                        "Cookie = "
                                + cookie.getName()
                );

                if ("jwt".equals(cookie.getName())) {

                    String token =
                            cookie.getValue();

                    if (token != null
                            && !token.isBlank()) {

                        System.out.println(
                                "JWT found in cookie"
                        );

                        return token;
                    }
                }
            }
        }

        /*
         * ================================
         * No JWT
         * ================================
         */
        System.out.println("NO JWT FOUND");

        return null;
    }

    /*
     * ================================
     * USER
     * ================================
     */

    @Override
    public boolean isUser() {

        return getCurrentSession()
                .getLoginType()
                == CurrentSession.LoginType.USER;
    }

    /*
     * ================================
     * EMPLOYEE
     * ================================
     */

    @Override
    public boolean isEmployee() {

        return getCurrentSession()
                .getLoginType()
                == CurrentSession.LoginType.EMPLOYEE;
    }

    /*
     * ================================
     * USER ID
     * ================================
     */

    @Override
    public Long getUserId() {

        return getCurrentSession()
                .getUserId();
    }

    /*
     * ================================
     * EMPLOYEE ID
     * ================================
     */

    @Override
    public Long getEmployeeId() {

        return getCurrentSession()
                .getEmployeeId();
    }
}