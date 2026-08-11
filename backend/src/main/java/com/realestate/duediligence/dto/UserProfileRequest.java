package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileRequest {
    private String name;
    private String phoneNumber;
    private String bio;
    private String avatarUrl;
    private String location;
}
