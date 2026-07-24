package com.realestate.duediligence.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.realestate.duediligence.dto.ZoningRequest;
import com.realestate.duediligence.dto.ZoningResponse;
import com.realestate.duediligence.service.ZoningService;

@RestController
@RequestMapping("/api/zoning")
@CrossOrigin(origins = "*")
public class ZoningController {

    private final ZoningService service;

    public ZoningController(ZoningService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ZoningResponse> create(@RequestBody ZoningRequest request) {
        return ResponseEntity.ok(service.createZoning(request));
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<ZoningResponse> get(@PathVariable Integer propertyId) {
        return ResponseEntity.ok(service.getZoning(propertyId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ZoningResponse> update(@PathVariable Integer id, @RequestBody ZoningRequest request) {
        return ResponseEntity.ok(service.updateZoning(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        service.deleteZoning(id);
        return ResponseEntity.ok("Zoning record deleted successfully");
    }
}
