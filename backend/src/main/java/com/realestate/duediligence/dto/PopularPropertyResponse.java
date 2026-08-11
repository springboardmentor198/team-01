package com.realestate.duediligence.dto;
import lombok.Builder;
import lombok.Value;
@Value @Builder public class PopularPropertyResponse { Integer propertyId; String propertyCode; String address; String city; String propertyType; String status; String imageUrl; String riskLevel; long viewCount; long uniqueViewerCount; long popularityScore; boolean trending; }
