package com.realestate.duediligence.dto;

import java.time.LocalDateTime;

import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RoleRequestResponse {

    private Integer id;
    private Integer userId;
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
