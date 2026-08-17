package com.realestate.duediligence.dto;

import lombok.Data;
import com.realestate.duediligence.enums.Role;

@Data
public class RegisterRequest {

    private String name;

    private String email;

    private String password;

    private String avatarUrl;

    private String phoneNumber;

    private Role role;
}
