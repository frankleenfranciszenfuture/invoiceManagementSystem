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

            return CurrentSession.builder()
                    .loginType(
                            CurrentSession.LoginType.valueOf(type)
                    )
                    .userId(
                            jwtUtil.extractUserId(token)
                    )
                    .employeeId(
                            jwtUtil.extractEmployeeId(token)
                    )
                    .username(
                            jwtUtil.extractEmail(token)
                    )
                    .role(
                            jwtUtil.extractClaim(
                                    token,
                                    claims -> claims.get(
                                            "role",
                                            String.class
                                    )
                            )
                    )
                    .build();

        } catch (Exception ex) {

            throw new ValidationException(
                    "Invalid JWT token"
            );
        }
    }

    /**
     * JWT priority:
     * <p>
     * 1. Authorization header
     * 2. HttpOnly jwt cookie
     */
    private String extractToken(HttpServletRequest request) {

        String authorizationHeader =
                request.getHeader("Authorization");

        System.out.println("Authorization Header = "
                + authorizationHeader);

        if (authorizationHeader != null
                && authorizationHeader.startsWith("Bearer ")) {

            String token =
                    authorizationHeader.substring(7).trim();

            if (!token.isBlank()) {
                System.out.println("JWT found in Authorization header");
                return token;
            }
        }

        Cookie[] cookies = request.getCookies();

        if (cookies != null) {

            for (Cookie cookie : cookies) {

                System.out.println(
                        "Cookie = "
                                + cookie.getName()
                );

                if ("jwt".equals(cookie.getName())) {

                    String token = cookie.getValue();

                    if (token != null && !token.isBlank()) {

                        System.out.println(
                                "JWT found in cookie"
                        );

                        return token;
                    }
                }
            }
        }

        System.out.println("NO JWT FOUND");

        return null;
    }


    @Override
    public boolean isUser() {
        return getCurrentSession().getLoginType()
                == CurrentSession.LoginType.USER;
    }

    @Override
    public boolean isEmployee() {
        return getCurrentSession().getLoginType()
                == CurrentSession.LoginType.EMPLOYEE;
    }

    @Override
    public Long getUserId() {
        return getCurrentSession().getUserId();
    }

    @Override
    public Long getEmployeeId() {
        return getCurrentSession().getEmployeeId();
    }
}
