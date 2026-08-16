package com.realestate.duediligence.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.support.CreateSupportTicketRequest;
import com.realestate.duediligence.dto.support.SupportTicketResponse;
import com.realestate.duediligence.service.SupportTicketService;
import com.realestate.duediligence.util.JwtService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/support/tickets")
@CrossOrigin(origins = "*")
public class UserSupportTicketController {

    private final SupportTicketService supportTicketService;
    private final JwtService jwtService;

    public UserSupportTicketController(
            SupportTicketService supportTicketService,
            JwtService jwtService) {

        this.supportTicketService = supportTicketService;
        this.jwtService = jwtService;
    }

    /**
     * Create a support ticket for the logged-in user.
     */
    @PostMapping
    public ResponseEntity<SupportTicketResponse> createTicket(

            @RequestHeader(
                    value = "Authorization",
                    required = false
            )
            String authHeader,

            @Valid @RequestBody
            CreateSupportTicketRequest request) {

        String userEmail = extractUserEmail(authHeader);

        SupportTicketResponse response =
                supportTicketService.createTicket(
                        userEmail,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * Extract logged-in user's email from JWT.
     */
    private String extractUserEmail(String authHeader) {

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            throw new org.springframework.web.server
                    .ResponseStatusException(
                            HttpStatus.UNAUTHORIZED,
                            "Missing or invalid Authorization header"
                    );
        }

        try {

            return jwtService.extractUsername(
                    authHeader.substring(7)
            );

        } catch (Exception exception) {

            throw new org.springframework.web.server
                    .ResponseStatusException(
                            HttpStatus.UNAUTHORIZED,
                            "Token verification failed"
                    );
        }
    }
}