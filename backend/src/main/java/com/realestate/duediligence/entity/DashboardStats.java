package com.realestate.duediligence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "dashboard_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stat_id")
    private Long statId;

    @Column(name = "total_properties")
    private Integer totalProperties;

    @Column(name = "total_reports")
    private Integer totalReports;

    @Column(name = "high_risk_properties")
    private Integer highRiskProperties;

    @Column(name = "total_users")
    private Integer totalUsers;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
}