package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.LoginRequest;
import com.realestate.duediligence.dto.RegisterRequest;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.dto.ForgotPasswordRequest;
import com.realestate.duediligence.dto.GoogleLoginRequest;
import com.realestate.duediligence.dto.GoogleLoginResponse;


public interface UserService {

    User register(RegisterRequest request);

    String login(LoginRequest request);
    
    String forgotPassword(ForgotPasswordRequest request);

    String googleLogin(GoogleLoginRequest request);
}