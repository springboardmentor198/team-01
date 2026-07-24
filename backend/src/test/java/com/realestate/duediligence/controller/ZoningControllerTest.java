package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.ZoningRequest;
import com.realestate.duediligence.dto.ZoningResponse;
import com.realestate.duediligence.service.ZoningService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

public class ZoningControllerTest {

    @Mock
    private ZoningService zoningService;

    @InjectMocks
    private ZoningController zoningController;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetZoning() {
        ZoningResponse mockResponse = ZoningResponse.builder()
                .id(1)
                .propertyId(1)
                .zoneType("Residential")
                .landUse("Residential Housing")
                .far("2.5")
                .buildingHeight("15 m")
                .restrictions("No Commercial Activities")
                .complianceStatus("COMPLIANT")
                .zoningRisk("LOW")
                .build();

        Mockito.when(zoningService.getZoning(1)).thenReturn(mockResponse);

        ResponseEntity<ZoningResponse> response = zoningController.get(1);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(200, response.getStatusCode().value());
        Assertions.assertEquals("Residential", response.getBody().getZoneType());
        Assertions.assertEquals("2.5", response.getBody().getFar());
        Assertions.assertEquals("COMPLIANT", response.getBody().getComplianceStatus());
        Assertions.assertEquals("LOW", response.getBody().getZoningRisk());
    }

    @Test
    public void testCreateZoning() {
        ZoningRequest request = ZoningRequest.builder()
                .propertyId(1)
                .zoneType("Commercial")
                .landUse("Office Spaces")
                .far("3.0")
                .buildingHeight("25 m")
                .restrictions("No Residential Activities")
                .build();

        ZoningResponse mockResponse = ZoningResponse.builder()
                .id(1)
                .propertyId(1)
                .zoneType("Commercial")
                .landUse("Office Spaces")
                .far("3.0")
                .buildingHeight("25 m")
                .restrictions("No Residential Activities")
                .complianceStatus("COMPLIANT")
                .zoningRisk("LOW")
                .build();

        Mockito.when(zoningService.createZoning(request)).thenReturn(mockResponse);

        ResponseEntity<ZoningResponse> response = zoningController.create(request);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(200, response.getStatusCode().value());
        Assertions.assertEquals("Commercial", response.getBody().getZoneType());
        Assertions.assertEquals("3.0", response.getBody().getFar());
        Assertions.assertEquals("COMPLIANT", response.getBody().getComplianceStatus());
        Assertions.assertEquals("LOW", response.getBody().getZoningRisk());
    }

    @Test
    public void testUpdateZoning() {
        ZoningRequest request = ZoningRequest.builder()
                .propertyId(1)
                .zoneType("Industrial")
                .build();

        ZoningResponse mockResponse = ZoningResponse.builder()
                .id(1)
                .propertyId(1)
                .zoneType("Industrial")
                .complianceStatus("NON_COMPLIANT")
                .zoningRisk("HIGH")
                .build();

        Mockito.when(zoningService.updateZoning(1, request)).thenReturn(mockResponse);

        ResponseEntity<ZoningResponse> response = zoningController.update(1, request);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(200, response.getStatusCode().value());
        Assertions.assertEquals("Industrial", response.getBody().getZoneType());
        Assertions.assertEquals("NON_COMPLIANT", response.getBody().getComplianceStatus());
        Assertions.assertEquals("HIGH", response.getBody().getZoningRisk());
    }

    @Test
    public void testDeleteZoning() {
        Mockito.doNothing().when(zoningService).deleteZoning(1);

        ResponseEntity<String> response = zoningController.delete(1);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(200, response.getStatusCode().value());
        Assertions.assertEquals("Zoning record deleted successfully", response.getBody());
    }
}
