package com.realestate.duediligence.config;

import java.security.Principal;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import com.realestate.duediligence.util.JwtService;

@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    public StompAuthChannelInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );

        if (accessor != null &&
                StompCommand.CONNECT.equals(accessor.getCommand())) {

            String authHeader =
                    accessor.getFirstNativeHeader("Authorization");

            System.out.println("========== STOMP CONNECT ==========");
            System.out.println(
                    "Authorization header received: "
                    + (authHeader != null ? "YES" : "NO")
            );

            if (authHeader == null ||
                    !authHeader.startsWith("Bearer ")) {

                System.out.println("ERROR: Missing Bearer token");

                throw new IllegalArgumentException(
                        "missing bearer token"
                );
            }

            String token = authHeader.substring(7);

            boolean valid = jwtService.isTokenValid(token);

            System.out.println("JWT valid: " + valid);

            if (!valid) {
                System.out.println(
                        "ERROR: Invalid or expired JWT"
                );

                throw new IllegalArgumentException(
                        "Invalid or expired token"
                );
            }

            String email = jwtService.extractUsername(token);

            System.out.println(
                    "JWT username/email: " + email
            );

            Principal principal = () -> email;

            accessor.setUser(principal);

            System.out.println(
                    "STOMP authentication successful"
            );

            System.out.println(
                    "=================================="
            );
        }

        return message;
    }
}