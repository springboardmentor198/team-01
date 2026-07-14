package com.realestate.property_search_api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_assessments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RiskAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assessment_id")
    private Long assessmentId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "assessed_by", nullable = false)
    private Long assessedBy;

    @Column(name = "overall_score")
    private Integer overallScore;

    @Column(name = "risk_level", length = 20)
    private String riskLevel;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "assessment_date", insertable = false, updatable = false)
    private LocalDateTime assessmentDate;
}
