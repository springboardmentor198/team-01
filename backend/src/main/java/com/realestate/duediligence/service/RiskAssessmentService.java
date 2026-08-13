package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.RiskAssessmentResponse;

public interface RiskAssessmentService {

    RiskAssessmentResponse calculateRisk(Integer propertyId);
}
