package com.realestate.duediligence.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ComparablePropertyResponse {
    private final Integer propertyId;
    private final String propertyCode;
    private final String city;
    private final BigDecimal areaSqft;
    private final BigDecimal estimatedPrice;
    private final BigDecimal pricePerSqft;
    private final String overallRisk;
}
