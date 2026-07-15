package com.realestate.duediligence.service.external;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class GovernmentApiService {

    public Map<String, Object> verifyProperty(String propertyCode) {

        Map<String, Object> response = new HashMap<>();

        response.put("propertyCode", propertyCode);
        response.put("ownershipVerified", true);
        response.put("taxStatus", "CLEAR");
        response.put("legalStatus", "NO_DISPUTE");
        response.put("lastUpdated", "2026-07-15");

        return response;
    }
}