package com.realestate.duediligence.dto;

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
public class RecentSearchResponse {

    private Long searchId;

    private Integer userId;
    private String userName;
    private String userEmail;

    private String property;
    private String propertyType;
    private String risk;
    private String status;

    private String query;
    private String city;

    private Integer propertyId;
    private LocalDateTime searchedAt;
}

