package com.realestate.duediligence.dto;

import com.realestate.duediligence.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProfileCompletionResponse {

    private String message;
    private String nextStep;
    private Boolean profileCompleted;
    private Role role;
}
