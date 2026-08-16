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
public class VerificationSummaryResponse {
    private Long totalVerifications;
    private Long approvedVerifications;
    private Long pendingVerifications;
    private Long rejectedVerifications;
}
