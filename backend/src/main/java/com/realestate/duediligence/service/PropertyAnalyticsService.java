package com.realestate.duediligence.service;

import java.util.List;

import com.realestate.duediligence.dto.ComparablePropertyResponse;
import com.realestate.duediligence.dto.PropertyValuationResponse;

public interface PropertyAnalyticsService {
    List<ComparablePropertyResponse> getComparables(Integer propertyId);
    PropertyValuationResponse getValuation(Integer propertyId);
}
