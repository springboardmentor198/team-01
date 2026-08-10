package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.ActivityLogResponse;
import com.realestate.duediligence.service.ActivityLogService;
import com.realestate.duediligence.util.JwtService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity-log")
@CrossOrigin(origins = "*")
public class ActivityLogController {

    private final ActivityLogService service;
    private final JwtService jwtService;

    public ActivityLogController(
            ActivityLogService service,
            JwtService jwtService
    ) {
        this.service = service;
        this.jwtService = jwtService;
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<List<ActivityLogResponse>> getLogs(
            @PathVariable Integer propertyId
    ) {

        return ResponseEntity.ok(
                service.getActivityLogs(propertyId)
        );
    }

    @PostMapping("/{propertyId}/view")
    public ResponseEntity<Void> recordPropertyView(
            @PathVariable Integer propertyId,
            @RequestHeader(
                    value = "Authorization",
                    required = false
            ) String authHeader
    ) {

        if (
                authHeader == null ||
                !authHeader.startsWith("Bearer ")
        ) {
            return ResponseEntity.status(401).build();
        }

        try {
            service.recordPropertyView(propertyId,
                    jwtService.extractUsername(authHeader.substring(7)));
        } catch (Exception exception) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok().build();
    }
}
