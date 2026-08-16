package com.realestate.duediligence.dto.admin;

import java.math.BigDecimal;
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
public class TransactionResponse {
    private Integer transactionId;
    private Integer propertyId;
    private String propertyTitle;
    private Integer buyerId;
    private String buyerName;
    private Integer agentId;
    private String agentName;
    private BigDecimal amount;
    private String status;
    private LocalDateTime createdAt;
}
