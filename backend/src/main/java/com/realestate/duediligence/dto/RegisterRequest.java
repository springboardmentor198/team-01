package com.realestate.duediligence.dto;

import com.realestate.duediligence.enums.Role;
import lombok.Data;

@Data
public class RegisterRequest {

    private String name;
    private String email;
    private String password;
    private String avatarUrl;
    private Role role;

}