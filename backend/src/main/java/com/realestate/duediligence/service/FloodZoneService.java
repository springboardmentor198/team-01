package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.FloodZoneResponse;

public interface FloodZoneService {
    FloodZoneResponse getFloodZone(Integer propertyId);
    FloodZoneResponse verifyFloodZone(Integer propertyId);
}
