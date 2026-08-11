package com.realestate.duediligence.dto;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;
@Value @Builder public class SavedSearchResponse { Long id; String name; String propertyType; String city; String riskLevel; String status; LocalDateTime createdAt; }
