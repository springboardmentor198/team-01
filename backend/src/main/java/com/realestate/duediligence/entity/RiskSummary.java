package com.realestate.duediligence.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "risk_summary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "risk_score")
    private Integer riskScore;

    @Column(name = "overall_risk")
    private String overallRisk;

    @Column(name = "flood_risk")
    private String floodRisk;

    @Column(name = "legal_risk")
    private String legalRisk;

    @Column(name = "environmental_risk")
    private String environmentalRisk;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @Column(name = "reviewed_by")
private String reviewedBy;

@Column(name = "reviewed_at")
private LocalDateTime reviewedAt;

@Column(name = "compliance_status")
private String complianceStatus;

@Column(name = "critical_issues", columnDefinition = "TEXT")
private String criticalIssues;

@Column(name = "recommendation", columnDefinition = "TEXT")
private String recommendation;

@Column(name = "missing_documents", columnDefinition = "TEXT")
private String missingDocuments;

@Column(name = "financial_risk")
private String financialRisk;

@Column(name = "market_risk")
private String marketRisk;

@Column(name = "ownership_risk")
private String ownershipRisk;

@Column(name = "risk_trend")
private String riskTrend;
}