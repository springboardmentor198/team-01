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
public class AdminPropertyResponse {
    private Integer propertyId;
    private String propertyCode;
    private String parcelId;
    private String address;
    private String city;
    private String state;
    private String country;
    private String propertyType;
    private String landUse;
    private BigDecimal lotSizeSqft;
    private BigDecimal estimatedPrice;
    private Integer yearBuilt;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer ownerId;
    private String ownerName;
    private String status;
    private String imageUrl;
    private LocalDateTime lastUpdated;
    private LocalDateTime createdAt;
}
