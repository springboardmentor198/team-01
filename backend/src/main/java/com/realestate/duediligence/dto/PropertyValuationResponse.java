package com.realestate.duediligence.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PropertyValuationResponse {
    private final BigDecimal estimatedValue;
    private final BigDecimal lowEstimate;
    private final BigDecimal highEstimate;
    private final BigDecimal pricePerSqft;
    private final int comparableCount;
    private final List<BigDecimal> comparableValues;
}
