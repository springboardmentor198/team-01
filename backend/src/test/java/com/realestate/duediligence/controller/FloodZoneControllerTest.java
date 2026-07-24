package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.FloodZoneResponse;
import com.realestate.duediligence.service.FloodZoneService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

public class FloodZoneControllerTest {

    @Mock
    private FloodZoneService floodZoneService;

    @InjectMocks
    private FloodZoneController floodZoneController;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetFloodZone() {
        FloodZoneResponse mockResponse = FloodZoneResponse.builder()
                .id(1)
                .propertyId(1)
                .zone("Zone X")
                .riskLevel("Low")
                .elevation("42 m above sea level")
                .femaClassification("Not in Special Flood Hazard Area")
                .insuranceRequired(false)
                .build();

        Mockito.when(floodZoneService.getFloodZone(1)).thenReturn(mockResponse);

        ResponseEntity<FloodZoneResponse> response = floodZoneController.get(1);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(200, response.getStatusCode().value());
        Assertions.assertEquals("Zone X", response.getBody().getZone());
        Assertions.assertEquals("Low", response.getBody().getRiskLevel());
        Assertions.assertFalse(response.getBody().getInsuranceRequired());
    }

    @Test
    public void testVerifyFloodZone() {
        FloodZoneResponse mockResponse = FloodZoneResponse.builder()
                .id(1)
                .propertyId(1)
                .zone("Zone AE")
                .riskLevel("High")
                .elevation("10 m above sea level")
                .femaClassification("In Special Flood Hazard Area")
                .insuranceRequired(true)
                .build();

        Mockito.when(floodZoneService.verifyFloodZone(1)).thenReturn(mockResponse);

        ResponseEntity<FloodZoneResponse> response = floodZoneController.verify(1);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(200, response.getStatusCode().value());
        Assertions.assertEquals("Zone AE", response.getBody().getZone());
        Assertions.assertEquals("High", response.getBody().getRiskLevel());
        Assertions.assertTrue(response.getBody().getInsuranceRequired());
    }
}
