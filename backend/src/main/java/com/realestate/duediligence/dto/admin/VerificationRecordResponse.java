package com.realestate.duediligence.dto.admin;

import java.time.LocalDateTime;

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
public class VerificationRecordResponse {
    private Integer verificationId;
    private Integer propertyId;
    private String propertyTitle;
    private Integer verifierId;
    private String verifierName;
    private String type;
    private String status;
    private String remarks;
    private LocalDateTime verifiedAt;
}
