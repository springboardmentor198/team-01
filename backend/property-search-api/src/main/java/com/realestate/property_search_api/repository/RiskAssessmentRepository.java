package com.realestate.property_search_api.repository;

import com.realestate.property_search_api.entity.RiskAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RiskAssessmentRepository extends JpaRepository<RiskAssessment, Long> {
    
    // Find all assessments for a specific property
    List<RiskAssessment> findByPropertyId(Long propertyId);
    
    // Count assessments by risk level
    long countByRiskLevel(String riskLevel);
    
    // Count assessments in specific risk levels
    long countByRiskLevelIn(List<String> riskLevels);
}
