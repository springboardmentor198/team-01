package com.realestate.duediligence.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardOverviewResponse {
    private Long totalUsers;
    private Long verifiedProfessionals;
    private Long pendingRoleRequests;
    private Long totalProperties;
    private Long approvedProperties;
    private Long pendingProperties;
}
