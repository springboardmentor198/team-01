package com.realestate.duediligence.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnershipResponse {

    private Integer ownershipId;

    private Integer propertyId;

    private String ownerName;

    private String ownerType;

    private String registrationNumber;

    private Boolean verified;

    private LocalDateTime ownershipStartDate;

    private LocalDateTime ownershipEndDate;
}
