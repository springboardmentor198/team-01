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

import com.realestate.duediligence.dto.DocumentRequest;
import com.realestate.duediligence.dto.DocumentResponse;
import com.realestate.duediligence.service.DocumentService;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentService service;

    public DocumentController(DocumentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<DocumentResponse> create(@RequestBody DocumentRequest request) {
        return ResponseEntity.ok(service.createDocument(request));
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<List<DocumentResponse>> getDocuments(@PathVariable Integer propertyId) {
        return ResponseEntity.ok(service.getDocuments(propertyId));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Void> downloadDocument(
            @PathVariable Integer id,
            @org.springframework.web.bind.annotation.RequestParam(value = "email", required = false) String email) {
        DocumentResponse doc = service.downloadDocument(id, email);
        return ResponseEntity.status(org.springframework.http.HttpStatus.FOUND)
                .location(java.net.URI.create(doc.getFileUrl()))
                .build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentResponse> update(
            @PathVariable Integer id,
            @RequestBody DocumentRequest request) {

        return ResponseEntity.ok(service.updateDocument(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {

        service.deleteDocument(id);
        return ResponseEntity.ok("Document deleted successfully");
    }
}