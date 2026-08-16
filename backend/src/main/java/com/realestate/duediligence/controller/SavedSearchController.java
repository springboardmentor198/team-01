package com.realestate.duediligence.controller;

import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import com.realestate.duediligence.dto.SavedSearchRequest;
import com.realestate.duediligence.dto.SavedSearchResponse;
import com.realestate.duediligence.entity.SavedSearch;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.SavedSearchRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.util.JwtService;
import lombok.RequiredArgsConstructor;

@RestController @RequestMapping("/api/saved-searches") @CrossOrigin(origins = "*") @RequiredArgsConstructor
public class SavedSearchController {
    private final SavedSearchRepository repository; private final UserRepository userRepository; private final JwtService jwtService;
    @GetMapping public ResponseEntity<?> list(@RequestHeader(value="Authorization", required=false) String auth) { User user = user(auth); return user == null ? ResponseEntity.status(401).build() : ResponseEntity.ok(repository.findByUser_UserIdOrderByCreatedAtDesc(user.getUserId()).stream().map(this::response).toList()); }
    @PostMapping public ResponseEntity<?> create(@RequestHeader(value="Authorization", required=false) String auth, @RequestBody SavedSearchRequest request) { User user = user(auth); if (user == null) return ResponseEntity.status(401).build(); if (request.getName() == null || request.getName().isBlank()) return ResponseEntity.badRequest().body("A saved search name is required"); SavedSearch saved = repository.save(SavedSearch.builder().user(user).name(request.getName().trim()).propertyType(request.getPropertyType()).city(request.getCity()).riskLevel(request.getRiskLevel()).status(request.getStatus()).build()); return ResponseEntity.status(HttpStatus.CREATED).body(response(saved)); }
    @DeleteMapping("/{id}") public ResponseEntity<?> delete(@RequestHeader(value="Authorization", required=false) String auth, @PathVariable Long id) { User user = user(auth); if (user == null) return ResponseEntity.status(401).build(); return repository.findByIdAndUser_UserId(id, user.getUserId()).map(item -> { repository.delete(item); return ResponseEntity.noContent().build(); }).orElseGet(() -> ResponseEntity.notFound().build()); }
    private User user(String auth) { if (auth == null || !auth.startsWith("Bearer ")) return null; try { return userRepository.findByEmail(jwtService.extractUsername(auth.substring(7))).orElse(null); } catch (Exception e) { return null; } }
    private SavedSearchResponse response(SavedSearch item) { return SavedSearchResponse.builder().id(item.getId()).name(item.getName()).propertyType(item.getPropertyType()).city(item.getCity()).riskLevel(item.getRiskLevel()).status(item.getStatus()).createdAt(item.getCreatedAt()).build(); }
}
