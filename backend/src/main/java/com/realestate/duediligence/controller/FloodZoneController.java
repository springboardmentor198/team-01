package com.realestate.duediligence.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.realestate.duediligence.dto.FloodZoneResponse;
import com.realestate.duediligence.service.FloodZoneService;

@RestController
@RequestMapping("/api/flood-zone")
@CrossOrigin(origins = "*")
public class FloodZoneController {

    private final FloodZoneService service;

    public FloodZoneController(FloodZoneService service) {
        this.service = service;
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<FloodZoneResponse> get(@PathVariable Integer propertyId) {
        return ResponseEntity.ok(service.getFloodZone(propertyId));
    }

    @PostMapping("/verify/{propertyId}")
    public ResponseEntity<FloodZoneResponse> verify(@PathVariable Integer propertyId) {
        return ResponseEntity.ok(service.verifyFloodZone(propertyId));
    }
}
