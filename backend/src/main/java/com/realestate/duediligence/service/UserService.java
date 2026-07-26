package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.ForgotPasswordResponse;
import com.realestate.duediligence.dto.GoogleLoginRequest;
import com.realestate.duediligence.dto.LoginRequest;
import com.realestate.duediligence.dto.RegisterRequest;
import com.realestate.duediligence.dto.ResetPasswordRequest;
import com.realestate.duediligence.entity.User;


public interface UserService {

    User register(RegisterRequest request);

    String login(LoginRequest request);

    ForgotPasswordResponse requestPasswordReset(String email);

    void verifyResetOtp(String email, String token);

    void resetPassword(ResetPasswordRequest request);

    String googleLogin(GoogleLoginRequest request);

}
