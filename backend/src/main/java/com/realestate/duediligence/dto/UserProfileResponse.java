package com.realestate.duediligence.dto;

import java.time.LocalDateTime;

import com.realestate.duediligence.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Integer userId;
    private String name;
    private String email;
    private String phoneNumber;
    private String bio;
    private String avatarUrl;
    private Role role;
    private String location;
    private LocalDateTime joinDate;
}