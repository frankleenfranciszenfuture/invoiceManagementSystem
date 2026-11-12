package com.ims.config.websocket;

import lombok.extern.slf4j.Slf4j;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;

import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
@Slf4j
public class NotificationChannelInterceptor
        implements ChannelInterceptor {

    private static final String NOTIFICATION_DESTINATION =
            "/user/queue/notifications";


    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel
    ) {

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(message);

        StompCommand command = accessor.getCommand();

        if (command == null) {
            return message;
        }

        Principal principal = accessor.getUser();

        /*
         * CONNECT
         */
        if (StompCommand.CONNECT.equals(command)) {

            if (principal == null
                    || principal.getName() == null
                    || principal.getName().isBlank()) {

                throw new IllegalArgumentException(
                        "Unauthenticated WebSocket connection."
                );
            }

            return message;
        }

        /*
         * SUBSCRIBE
         */
        if (StompCommand.SUBSCRIBE.equals(command)) {

            if (principal == null) {
                throw new IllegalArgumentException(
                        "Authentication is required for subscriptions."
                );
            }

            String destination = accessor.getDestination();

            if (!NOTIFICATION_DESTINATION.equals(destination)) {

                log.warn(
                        "Rejected unauthorized WebSocket subscription."
                );

                throw new IllegalArgumentException(
                        "Subscription to this destination is not allowed."
                );
            }

            return message;
        }

        /*
         * UNSUBSCRIBE / DISCONNECT
         */
        if (StompCommand.UNSUBSCRIBE.equals(command)
                || StompCommand.DISCONNECT.equals(command)) {

            if (principal == null) {
                throw new IllegalArgumentException(
                        "Unauthenticated WebSocket operation."
                );
            }

            return message;
        }

        /*
         * No client-originated SEND, MESSAGE, ACK, or other
         * operations are required by the notification client.
         */
        throw new IllegalArgumentException(
                "This WebSocket operation is not allowed."
        );
    }
}