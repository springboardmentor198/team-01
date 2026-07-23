package com.realestate.duediligence.dto;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RiskDistributionResponse { private long low; private long medium; private long high; private long critical; }
