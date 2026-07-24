package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.ZoningRequest;
import com.realestate.duediligence.dto.ZoningResponse;

public interface ZoningService {
    ZoningResponse createZoning(ZoningRequest request);
    ZoningResponse getZoning(Integer propertyId);
    ZoningResponse updateZoning(Integer id, ZoningRequest request);
    void deleteZoning(Integer id);
}
