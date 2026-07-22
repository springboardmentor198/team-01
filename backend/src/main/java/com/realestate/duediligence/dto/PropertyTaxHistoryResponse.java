package com.realestate.duediligence.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyTaxHistoryResponse {
    private Long taxHistoryId;
    private Integer propertyId;
    private Integer taxYear;
    private BigDecimal assessedValue;
    private BigDecimal taxAmount;
    private String paymentStatus;
    private LocalDate dueDate;
    private LocalDate paymentDate;
}
