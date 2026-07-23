package com.realestate.duediligence.dto;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardStatsResponse { private long totalProperties; private long reportsGenerated; private long highRiskProperties; private long pendingReviews; }
