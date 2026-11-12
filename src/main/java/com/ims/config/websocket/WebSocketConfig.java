package com.ims.config.websocket;


import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.context.annotation.Configuration;

import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;

import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig
        implements WebSocketMessageBrokerConfigurer {

    private final NotificationHandshakeInterceptor handshakeInterceptor;

    private final NotificationHandshakeHandler handshakeHandler;

    private final NotificationChannelInterceptor channelInterceptor;

    @Value("${app.websocket.allowed-origins:http://localhost:5173}")
    private String[] allowedOrigins;


    // =========================================================
    // MESSAGE BROKER
    // =========================================================

    @Override
    public void configureMessageBroker(
            MessageBrokerRegistry registry
    ) {

        /*
         * User-specific notifications:
         *
         * /user/queue/notifications
         */
        registry.enableSimpleBroker(
                "/queue"
        );

        /*
         * Application destinations, reserved for server-side
         * message-handling controllers if needed in the future.
         */
        registry.setApplicationDestinationPrefixes(
                "/app"
        );

        /*
         * Enables convertAndSendToUser().
         */
        registry.setUserDestinationPrefix(
                "/user"
        );
    }


    // =========================================================
    // WEBSOCKET ENDPOINT
    // =========================================================

    @Override
    public void registerStompEndpoints(
            StompEndpointRegistry registry
    ) {

        registry.addEndpoint("/ws")
                .addInterceptors(handshakeInterceptor)
                .setHandshakeHandler(handshakeHandler)
                .setAllowedOriginPatterns(allowedOrigins);
    }


    // =========================================================
    // INBOUND SECURITY
    // =========================================================

    @Override
    public void configureClientInboundChannel(
            ChannelRegistration registration
    ) {

        registration.interceptors(
                channelInterceptor
        );
    }
}
