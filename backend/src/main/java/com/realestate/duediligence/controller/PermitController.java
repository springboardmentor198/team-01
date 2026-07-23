package com.realestate.duediligence.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.PermitRequest;
import com.realestate.duediligence.dto.PermitResponse;
import com.realestate.duediligence.service.PermitService;

@RestController
@RequestMapping("/api/permits")
@CrossOrigin(origins = "*")
public class PermitController {

    private final PermitService service;

    public PermitController(PermitService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<PermitResponse> create(@RequestBody PermitRequest request) {
        return ResponseEntity.ok(service.createPermit(request));
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<List<PermitResponse>> getPermits(@PathVariable Integer propertyId) {
        return ResponseEntity.ok(service.getPermits(propertyId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PermitResponse> update(
            @PathVariable Integer id,
            @RequestBody PermitRequest request) {

        return ResponseEntity.ok(service.updatePermit(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {

        service.deletePermit(id);
        return ResponseEntity.ok("Permit deleted successfully");
    }
}