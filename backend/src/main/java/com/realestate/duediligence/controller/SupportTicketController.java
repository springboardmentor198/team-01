package com.realestate.duediligence.controller;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.support.SupportTicketResponse;
import com.realestate.duediligence.dto.support.TicketReplyRequest;
import com.realestate.duediligence.dto.support.UpdateTicketStatusRequest;
import com.realestate.duediligence.enums.TicketPriority;
import com.realestate.duediligence.enums.TicketStatus;
import com.realestate.duediligence.service.SupportTicketService;
import com.realestate.duediligence.util.JwtService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/support/tickets")
@CrossOrigin(origins = "*")
public class SupportTicketController {

    private final SupportTicketService supportTicketService;
    private final JwtService jwtService;

    public SupportTicketController(
            SupportTicketService supportTicketService,
            JwtService jwtService) {

        this.supportTicketService = supportTicketService;
        this.jwtService = jwtService;
    }

    // =========================================================
    // GET ALL SUPPORT TICKETS
    // =========================================================

    @GetMapping
    public ResponseEntity<Page<SupportTicketResponse>> getTickets(

            @RequestHeader(
                    value = "Authorization",
                    required = false
            )
            String authHeader,

            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            TicketStatus status,

            @RequestParam(required = false)
            TicketPriority priority,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "createdAt")
            String sortBy,

            @RequestParam(defaultValue = "desc")
            String direction) {

        String adminEmail = extractAdminEmail(authHeader);

        Sort.Direction sortDirection =
                direction.equalsIgnoreCase("asc")
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(sortDirection, sortBy)
                );

        return ResponseEntity.ok(
                supportTicketService.getTickets(
                        adminEmail,
                        search,
                        status,
                        priority,
                        pageable
                )
        );
    }

    // =========================================================
    // GET PARTICULAR TICKET + MESSAGES
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<SupportTicketResponse> getTicketById(

            @RequestHeader(
                    value = "Authorization",
                    required = false
            )
            String authHeader,

            @PathVariable Long id) {

        String adminEmail = extractAdminEmail(authHeader);

        return ResponseEntity.ok(
                supportTicketService.getTicketById(
                        adminEmail,
                        id
                )
        );
    }

    // =========================================================
    // ASSIGN TICKET TO ADMIN
    // =========================================================

    @PatchMapping("/{id}/assign")
    public ResponseEntity<SupportTicketResponse> assignTicket(

            @RequestHeader(
                    value = "Authorization",
                    required = false
            )
            String authHeader,

            @PathVariable Long id,

            @RequestBody Map<String, Integer> request) {

        String adminEmail = extractAdminEmail(authHeader);

        Integer assignedAdminId =
                request.get("assignedAdminId");

        if (assignedAdminId == null) {

            throw new org.springframework.web.server
                    .ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "assignedAdminId is required"
                    );
        }

        SupportTicketResponse response =
                supportTicketService.assignTicket(
                        adminEmail,
                        id,
                        assignedAdminId
                );

        return ResponseEntity.ok(response);
    }
    // ============================================================
// UPDATE TICKET STATUS
// ============================================================

@PatchMapping("/{id}/status")
public ResponseEntity<SupportTicketResponse> updateTicketStatus(
        @RequestHeader(
                value = "Authorization",
                required = false
        ) String authHeader,

        @PathVariable Long id,

        @Valid @RequestBody UpdateTicketStatusRequest request) {

    String adminEmail = extractAdminEmail(authHeader);

    SupportTicketResponse response =
            supportTicketService.updateTicketStatus(
                    adminEmail,
                    id,
                    request
            );

    return ResponseEntity.ok(response);
}

    // =========================================================
    // REPLY TO SUPPORT TICKET
    // =========================================================

    @PostMapping("/{id}/reply")
    public ResponseEntity<SupportTicketResponse> replyToTicket(

            @RequestHeader(
                    value = "Authorization",
                    required = false
            )
            String authHeader,

            @PathVariable Long id,

            @Valid
            @RequestBody
            TicketReplyRequest request) {

        String adminEmail = extractAdminEmail(authHeader);

        SupportTicketResponse response =
                supportTicketService.replyToTicket(
                        adminEmail,
                        id,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // EXTRACT ADMIN EMAIL FROM JWT
    // =========================================================

    private String extractAdminEmail(String authHeader) {

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