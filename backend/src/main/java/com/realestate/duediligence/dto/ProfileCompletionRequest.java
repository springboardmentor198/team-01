package com.realestate.duediligence.dto;

import com.realestate.duediligence.enums.Role;
import lombok.Data;

@Data
public class ProfileCompletionRequest {

    private Role accountType;
}
