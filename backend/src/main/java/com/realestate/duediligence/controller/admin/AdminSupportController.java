package com.realestate.duediligence.controller.admin;

import org.springframework.data.domain.Pageable;
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

import com.realestate.duediligence.service.admin.AdminSupportService;
import com.realestate.duediligence.util.JwtService;

@RestController
@RequestMapping("/api/admin/support/tickets")
@CrossOrigin(origins = "*")
public class AdminSupportController {

    private final AdminSupportService adminSupportService;
    private final JwtService jwtService;

    public AdminSupportController(AdminSupportService adminSupportService, JwtService jwtService) {
        this.adminSupportService = adminSupportService;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<?> getTickets(
            @RequestHeader("Authorization") String authHeader,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String status,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String priority,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Integer assignedToId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Integer userId,
            Pageable pageable) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminSupportService.getTickets(email, status, priority, assignedToId, userId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminSupportService.getTicketById(email, id));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<?> assignTicket(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id,
            @RequestBody java.util.Map<String, Integer> body) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        Integer assignedToId = body.get("assignedToId");
        return ResponseEntity.ok(adminSupportService.assignTicket(email, id, assignedToId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateTicketStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id,
            @RequestBody java.util.Map<String, String> body) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        String status = body.get("status");
        return ResponseEntity.ok(adminSupportService.updateTicketStatus(email, id, status));
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<?> replyToTicket(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id,
            @RequestBody java.util.Map<String, String> body) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        String message = body.get("message");
        return ResponseEntity.ok(adminSupportService.replyToTicket(email, id, message));
    }
}
