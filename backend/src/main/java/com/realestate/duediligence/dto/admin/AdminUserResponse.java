package com.realestate.duediligence.dto.admin;

import java.time.LocalDateTime;

import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;

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
public class AdminUserResponse {
    private Integer userId;
    private String name;
    private String email;
    private Role role;
    private AccountStatus status;
    private String phoneNumber;
    private Boolean profileCompleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
