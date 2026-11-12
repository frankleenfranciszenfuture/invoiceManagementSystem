package com.ims.config.websocket;

import lombok.extern.slf4j.Slf4j;

import org.springframework.http.server.ServerHttpRequest;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.springframework.stereotype.Component;

import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class NotificationHandshakeHandler
        extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(
            ServerHttpRequest request,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {

        Object userIdAttribute =
                attributes.get(
                        NotificationHandshakeInterceptor.AUTHENTICATED_USER_ID
                );

        if (!(userIdAttribute instanceof Long userId)
                || userId <= 0) {

            return null;
        }

        /*
         * Principal name MUST equal the database user ID.
         *
         * NotificationPublisher uses:
         * convertAndSendToUser(userId.toString(), ...)
         */
        return new UsernamePasswordAuthenticationToken(
                userId.toString(),
                null,
                List.of(
                        new SimpleGrantedAuthority("ROLE_USER")
                )
        );
    }
}
