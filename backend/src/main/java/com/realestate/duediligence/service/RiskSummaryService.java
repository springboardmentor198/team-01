package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.RiskSummaryRequest;
import com.realestate.duediligence.dto.RiskSummaryResponse;

public interface RiskSummaryService {

    RiskSummaryResponse createRiskSummary(RiskSummaryRequest request);

    RiskSummaryResponse getRiskSummary(Integer propertyId);

    RiskSummaryResponse updateRiskSummary(Integer id, RiskSummaryRequest request);

   

    void deleteRiskSummary(Integer id);

}