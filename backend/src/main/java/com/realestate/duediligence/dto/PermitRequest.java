package com.realestate.duediligence.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermitRequest {

    private Integer propertyId;
    private String permitType;
    private String issuingAuthority;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String status;
    private String remarks;
}