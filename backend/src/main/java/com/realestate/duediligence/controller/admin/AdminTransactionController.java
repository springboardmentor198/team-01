package com.realestate.duediligence.controller.admin;

import java.time.LocalDateTime;

import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.service.admin.AdminTransactionService;
import com.realestate.duediligence.util.JwtService;

@RestController
@RequestMapping("/api/admin/transactions")
@CrossOrigin(origins = "*")
public class AdminTransactionController {

    private final AdminTransactionService adminTransactionService;
    private final JwtService jwtService;

    public AdminTransactionController(AdminTransactionService adminTransactionService, JwtService jwtService) {
        this.adminTransactionService = adminTransactionService;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<?> getTransactions(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer buyerId,
            @RequestParam(required = false) Integer agentId,
            @RequestParam(required = false) Integer propertyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminTransactionService.getTransactions(email, status, buyerId, agentId, propertyId, startDate, endDate, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id) {
        String email = jwtService.extractUsername(authHeader.substring(7));
        return ResponseEntity.ok(adminTransactionService.getTransactionById(email, id));
    }
}
