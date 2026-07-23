package com.realestate.duediligence.repository;

import java.util.Optional;
import java.util.List;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.RiskSummary;

@Repository
public interface RiskSummaryRepository extends JpaRepository<RiskSummary, Integer> {

    Optional<RiskSummary> findByProperty_PropertyId(Integer propertyId);
    long countByOverallRiskIgnoreCase(String overallRisk);
    List<RiskSummary> findAllByOrderByUpdatedAtDesc(Pageable pageable);

}
