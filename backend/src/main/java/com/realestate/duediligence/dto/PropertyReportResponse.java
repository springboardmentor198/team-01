package com.realestate.duediligence.dto;
import com.realestate.duediligence.entity.Property; import java.util.List; import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PropertyReportResponse { private Property property; private RiskSummaryResponse riskSummary; private List<DocumentResponse> documents; private List<PermitResponse> permits; }
