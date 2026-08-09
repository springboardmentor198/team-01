package com.realestate.duediligence.service.external;

import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class GovernmentApiService {

    private int attempts = 0;

    @Retryable(
            retryFor = Exception.class,
            maxAttempts = 3,
            backoff = @Backoff(delay = 2000)
    )
    public Map<String, Object> verifyProperty(String propertyCode) {

        attempts++;
        System.out.println("Attempt " + attempts + " to verify property...");

        // Simulate temporary external API failure
        if (attempts < 3) {
            throw new RuntimeException("Government API is temporarily unavailable.");
        }

        Map<String, Object> response = new HashMap<>();

        response.put("propertyCode", propertyCode);
        response.put("ownershipVerified", true);
        response.put("taxStatus", "CLEAR");
        response.put("legalStatus", "NO_DISPUTE");
        response.put("lastUpdated", "2026-07-15");

        attempts = 0; // reset after success

        return response;
    }

    @Recover
    public Map<String, Object> recover(Exception ex, String propertyCode) {

        System.out.println("All retry attempts failed.");

        Map<String, Object> response = new HashMap<>();
        response.put("propertyCode", propertyCode);
        response.put("status", "FAILED");
        response.put("message", "Government API unavailable after multiple retry attempts.");

        attempts = 0;

        return response;
    }
}