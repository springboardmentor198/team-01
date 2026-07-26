package com.realestate.duediligence.dto;

import com.realestate.duediligence.enums.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class RoleRequestRequest {

    @NotNull(message = "Requested role is required")
    private Role requestedRole;

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Company email is required")
    @Email(message = "Company email must be valid")
    private String companyEmail;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotNull(message = "Years of experience is required")
    @PositiveOrZero(message = "Years of experience must not be negative")
    private Integer yearsOfExperience;

    @NotBlank(message = "Document name is required")
    private String documentName;

    @NotBlank(message = "Document path is required")
    private String documentPath;

    @NotBlank(message = "Document MIME type is required")
    private String documentMimeType;

    @NotNull(message = "Document size is required")
    @PositiveOrZero(message = "Document size must not be negative")
    private Long documentSize;
}
