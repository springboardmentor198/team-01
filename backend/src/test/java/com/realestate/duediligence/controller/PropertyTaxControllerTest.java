package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.PropertyTaxHistoryResponse;
import com.realestate.duediligence.dto.PropertyTaxSummaryResponse;
import com.realestate.duediligence.service.PropertyTaxService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class PropertyTaxControllerTest {

    @Mock
    private PropertyTaxService propertyTaxService;

    @InjectMocks
    private PropertyTaxController propertyTaxController;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetTaxHistory() {
        List<PropertyTaxHistoryResponse> mockHistory = new ArrayList<>();
        mockHistory.add(PropertyTaxHistoryResponse.builder()
                .taxYear(2025)
                .taxAmount(BigDecimal.valueOf(3125.00))
                .paymentStatus("PENDING")
                .build());

        Mockito.when(propertyTaxService.getTaxHistoryByPropertyId(1)).thenReturn(mockHistory);

        ResponseEntity<List<PropertyTaxHistoryResponse>> response = propertyTaxController.getTaxHistory(1);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(200, response.getStatusCode().value());
        Assertions.assertEquals(1, response.getBody().size());
        Assertions.assertEquals(2025, response.getBody().get(0).getTaxYear());
    }

    @Test
    public void testGetTaxSummary() {
        PropertyTaxSummaryResponse mockSummary = PropertyTaxSummaryResponse.builder()
                .propertyId(1)
                .taxStatus("PENDING")
                .taxRisk("MEDIUM")
                .build();

        Mockito.when(propertyTaxService.getTaxSummaryByPropertyId(1)).thenReturn(mockSummary);

        ResponseEntity<PropertyTaxSummaryResponse> response = propertyTaxController.getTaxSummary(1);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(200, response.getStatusCode().value());
        Assertions.assertEquals("PENDING", response.getBody().getTaxStatus());
        Assertions.assertEquals("MEDIUM", response.getBody().getTaxRisk());
    }
}
