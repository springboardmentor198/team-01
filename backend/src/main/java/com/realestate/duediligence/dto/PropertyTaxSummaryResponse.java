package com.realestate.duediligence.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyTaxSummaryResponse {
    private Integer propertyId;
    private String taxStatus; // PAID, DELINQUENT, PENDING
    private String taxRisk;   // LOW, MEDIUM, HIGH
    private BigDecimal totalPaidAmount;
    private BigDecimal totalUnpaidAmount;
}
