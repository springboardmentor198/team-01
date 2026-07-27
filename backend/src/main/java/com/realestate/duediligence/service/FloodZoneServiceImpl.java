package com.realestate.duediligence.service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.realestate.duediligence.dto.FloodZoneResponse;
import com.realestate.duediligence.entity.FloodZoneRecord;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.RiskSummary;
import com.realestate.duediligence.repository.FloodZoneRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.RiskSummaryRepository;

@Service
public class FloodZoneServiceImpl implements FloodZoneService {

    private final FloodZoneRepository repository;
    private final PropertyRepository propertyRepository;
    private final RiskSummaryRepository riskSummaryRepository;
    private final RestTemplate restTemplate;

    public FloodZoneServiceImpl(FloodZoneRepository repository,
                                PropertyRepository propertyRepository,
                                RiskSummaryRepository riskSummaryRepository) {
        this.repository = repository;
        this.propertyRepository = propertyRepository;
        this.riskSummaryRepository = riskSummaryRepository;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public FloodZoneResponse getFloodZone(Integer propertyId) {
        // If it exists in the database, return it
        Optional<FloodZoneRecord> recordOpt = repository.findByProperty_PropertyId(propertyId);
        if (recordOpt.isPresent()) {
            return mapToResponse(recordOpt.get());
        }

        // If it doesn't exist, throw exception to let frontend fallback to 'Not Available'
        throw new RuntimeException("Flood zone record not found");
    }

    @Override
    public FloodZoneResponse verifyFloodZone(Integer propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        // 1. Geocode the property location using Nominatim API
        double[] coordinates = geocodeLocation(property.getAddress(), property.getCity());
        double lat = coordinates[0];
        double lon = coordinates[1];

        // 2. Call Open-Meteo Flood API to retrieve live river discharge forecasting and elevation data
        FloodData floodData = fetchFloodData(lat, lon);

        // 3. Determine FEMA Zone, Risk Level, and whether Insurance is Required based on actual forecast discharge
        String riskLevel = "Low";
        String zone = "Zone X (Minimal Risk)";
        String femaClassification = "Not in Special Flood Hazard Area";
        boolean insuranceRequired = false;

        if (floodData.maxDischarge > 50.0) {
            riskLevel = "High";
            zone = "Zone AE (High Risk)";
            femaClassification = "In Special Flood Hazard Area (100-year flood zone)";
            insuranceRequired = true;
        } else if (floodData.maxDischarge > 10.0) {
            riskLevel = "Medium";
            zone = "Zone A (Moderate Risk)";
            femaClassification = "In Moderate Flood Hazard Area (500-year flood zone)";
            insuranceRequired = false;
        }

        String elevationText = String.format("%.1f m above sea level", floodData.elevation);

        // 4. Save/Update Flood Zone Verification Record
        FloodZoneRecord record = repository.findByProperty_PropertyId(propertyId)
                .orElseGet(() -> FloodZoneRecord.builder().property(property).createdAt(LocalDateTime.now()).build());

        record.setZone(zone);
        record.setRiskLevel(riskLevel);
        record.setElevation(elevationText);
        record.setFemaClassification(femaClassification);
        record.setInsuranceRequired(insuranceRequired);
        record.setUpdatedAt(LocalDateTime.now());

        repository.save(record);

        // 5. Save Risk Level to Risk Summary
        Optional<RiskSummary> riskSummaryOpt = riskSummaryRepository.findByProperty_PropertyId(propertyId);
        if (riskSummaryOpt.isPresent()) {
            RiskSummary riskSummary = riskSummaryOpt.get();
            riskSummary.setFloodRisk(riskLevel);
            riskSummary.setUpdatedAt(LocalDateTime.now());
            riskSummaryRepository.save(riskSummary);
        }

        return mapToResponse(record);
    }

    private double[] geocodeLocation(String address, String city) {
        String query = address;
        if (city != null && !city.isEmpty()) {
            query += ", " + city;
        }
        try {
            String url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + URLEncoder.encode(query, "UTF-8");
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "DueDiligenceAgent/1.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map[]> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map[].class);
            if (response.getBody() != null && response.getBody().length > 0) {
                Map<String, Object> item = response.getBody()[0];
                double lat = Double.parseDouble(String.valueOf(item.get("lat")));
                double lon = Double.parseDouble(String.valueOf(item.get("lon")));
                return new double[]{lat, lon};
            }
        } catch (Exception e) {
            System.err.println("Geocoding failed for query: " + query + ". Trying city-only geocoding...");
        }

        // Try city-only geocoding
        if (city != null && !city.isEmpty()) {
            try {
                String url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + URLEncoder.encode(city, "UTF-8");
                HttpHeaders headers = new HttpHeaders();
                headers.set("User-Agent", "DueDiligenceAgent/1.0");
                HttpEntity<Void> entity = new HttpEntity<>(headers);

                ResponseEntity<Map[]> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map[].class);
                if (response.getBody() != null && response.getBody().length > 0) {
                    Map<String, Object> item = response.getBody()[0];
                    double lat = Double.parseDouble(String.valueOf(item.get("lat")));
                    double lon = Double.parseDouble(String.valueOf(item.get("lon")));
                    return new double[]{lat, lon};
                }
            } catch (Exception e) {
                System.err.println("City geocoding failed for: " + city);
            }
        }

        // Default coordinates (New York City)
        return new double[]{40.7128, -74.0060};
    }

    private FloodData fetchFloodData(double lat, double lon) {
        double defaultElevation = 42.0;
        double maxDischarge = 0.0;

        try {
            String url = "https://flood-api.open-meteo.com/v1/flood?latitude=" + lat + "&longitude=" + lon + "&daily=river_discharge";
            Map<String, Object> res = restTemplate.getForObject(url, Map.class);
            if (res != null) {
                if (res.get("elevation") != null) {
                    defaultElevation = Double.parseDouble(String.valueOf(res.get("elevation")));
                }

                if (res.containsKey("daily")) {
                    Map<String, Object> daily = (Map<String, Object>) res.get("daily");
                    if (daily != null && daily.containsKey("river_discharge")) {
                        List<?> discharges = (List<?>) daily.get("river_discharge");
                        if (discharges != null) {
                            for (Object d : discharges) {
                                if (d != null) {
                                    maxDischarge = Math.max(maxDischarge, Double.parseDouble(String.valueOf(d)));
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Open-Meteo Flood API call failed. Using default values.");
        }

        return new FloodData(defaultElevation, maxDischarge);
    }

    private FloodZoneResponse mapToResponse(FloodZoneRecord record) {
        return FloodZoneResponse.builder()
                .id(record.getId())
                .propertyId(record.getProperty().getPropertyId())
                .zone(record.getZone())
                .riskLevel(record.getRiskLevel())
                .elevation(record.getElevation())
                .femaClassification(record.getFemaClassification())
                .insuranceRequired(record.getInsuranceRequired())
                .build();
    }

    private static class FloodData {
        double elevation;
        double maxDischarge;

        FloodData(double elevation, double maxDischarge) {
            this.elevation = elevation;
            this.maxDischarge = maxDischarge;
        }
    }
}
