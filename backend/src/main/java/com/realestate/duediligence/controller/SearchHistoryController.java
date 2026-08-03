package com.realestate.duediligence.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.RecentSearchResponse;
import com.realestate.duediligence.dto.SearchHistoryRequest;
import com.realestate.duediligence.service.SearchHistoryService;
import com.realestate.duediligence.util.JwtService;

@RestController
@RequestMapping("/api/search-history")
@CrossOrigin(origins = "*")
public class SearchHistoryController {

    private final SearchHistoryService searchHistoryService;
    private final JwtService jwtService;

    public SearchHistoryController(
            SearchHistoryService searchHistoryService,
            JwtService jwtService) {
        this.searchHistoryService = searchHistoryService;
        this.jwtService = jwtService;
    }

    @PostMapping
    public ResponseEntity<?> recordSearch(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SearchHistoryRequest request) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }

        try {
            String email = jwtService.extractUsername(authHeader.substring(7));
            RecentSearchResponse response =
                    searchHistoryService.recordSearch(email, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Token verification failed: " + exception.getMessage());
        }
    }
}

