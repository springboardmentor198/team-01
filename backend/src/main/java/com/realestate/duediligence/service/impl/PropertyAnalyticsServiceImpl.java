package com.realestate.duediligence.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.ComparablePropertyResponse;
import com.realestate.duediligence.dto.PropertyValuationResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.exception.ResourceNotFoundException;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.RiskSummaryRepository;
import com.realestate.duediligence.service.PropertyAnalyticsService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PropertyAnalyticsServiceImpl implements PropertyAnalyticsService {
    private final PropertyRepository properties;
    private final RiskSummaryRepository risks;

    @Override
    public List<ComparablePropertyResponse> getComparables(Integer propertyId) {
        Property subject = getProperty(propertyId);
        if (subject.getCity() == null || subject.getPropertyType() == null) return List.of();
        return properties.findByCityIgnoreCaseAndPropertyTypeIgnoreCase(subject.getCity(), subject.getPropertyType())
                .stream().filter(p -> !propertyId.equals(p.getPropertyId()))
                .filter(this::hasPricing).limit(10).map(this::toComparable).toList();
    }

    @Override
    public PropertyValuationResponse getValuation(Integer propertyId) {
        Property subject = getProperty(propertyId);
        List<ComparablePropertyResponse> comparables = getComparables(propertyId);
        List<BigDecimal> values = comparables.stream().map(ComparablePropertyResponse::getEstimatedPrice).toList();
        BigDecimal rate = average(comparables.stream().map(ComparablePropertyResponse::getPricePerSqft).toList());
        BigDecimal value = subject.getLotSizeSqft() != null && rate != null
                ? subject.getLotSizeSqft().multiply(rate).setScale(2, RoundingMode.HALF_UP)
                : subject.getEstimatedPrice();
        return PropertyValuationResponse.builder().estimatedValue(value)
                .lowEstimate(values.stream().min(BigDecimal::compareTo).orElse(value))
                .highEstimate(values.stream().max(BigDecimal::compareTo).orElse(value))
                .pricePerSqft(rate).comparableCount(comparables.size()).comparableValues(values).build();
    }

    private Property getProperty(Integer id) {
        return properties.findById(id).orElseThrow(() -> new ResourceNotFoundException("Property not found"));
    }
    private boolean hasPricing(Property p) {
        return p.getEstimatedPrice() != null && p.getLotSizeSqft() != null
                && p.getLotSizeSqft().compareTo(BigDecimal.ZERO) > 0;
    }
    private ComparablePropertyResponse toComparable(Property p) {
        BigDecimal rate = p.getEstimatedPrice().divide(p.getLotSizeSqft(), 2, RoundingMode.HALF_UP);
        return ComparablePropertyResponse.builder().propertyId(p.getPropertyId()).propertyCode(p.getPropertyCode())
                .city(p.getCity()).areaSqft(p.getLotSizeSqft()).estimatedPrice(p.getEstimatedPrice())
                .pricePerSqft(rate).overallRisk(risks.findByProperty_PropertyId(p.getPropertyId())
                        .map(r -> r.getOverallRisk()).orElse(null)).build();
    }
    private BigDecimal average(List<BigDecimal> values) {
        return values.isEmpty() ? null : values.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(values.size()), 2, RoundingMode.HALF_UP);
    }
}
