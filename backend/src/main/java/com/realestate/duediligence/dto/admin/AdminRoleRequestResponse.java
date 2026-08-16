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
public class AdminRoleRequestResponse {
    private Integer requestId;
    private Integer userId;
    private String userName;
    private String email;
    private Role requestedRole;
    private String companyName;
    private String companyEmail;
    private String licenseNumber;
    private Integer yearsOfExperience;
    private String documentName;
    private String documentPath;
    private String documentMimeType;
    private Long documentSize;
    private AccountStatus status;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
