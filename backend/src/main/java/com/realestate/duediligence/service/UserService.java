package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.LoginRequest;
import com.realestate.duediligence.dto.RegisterRequest;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.dto.ForgotPasswordRequest;


public interface UserService {

    User register(RegisterRequest request);

    String login(LoginRequest request);
    
    String forgotPassword(ForgotPasswordRequest request);
}