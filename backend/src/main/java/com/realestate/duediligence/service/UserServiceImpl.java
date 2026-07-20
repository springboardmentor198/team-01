package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.ForgotPasswordRequest;
import com.realestate.duediligence.dto.LoginRequest;
import com.realestate.duediligence.dto.RegisterRequest;
import com.realestate.duediligence.entity.PasswordResetToken;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.PasswordResetTokenRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.util.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.realestate.duediligence.dto.GoogleLoginRequest;
import com.realestate.duediligence.dto.GoogleLoginResponse;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Override
    public User register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .avatarUrl(request.getAvatarUrl())
                .role(request.getRole())
                .phoneNumber(request.getPhoneNumber())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    @Override
    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid Email"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid Password");
        }

        return jwtService.generateToken(user.getEmail());
    }

    @Override
    public String forgotPassword(ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found with email: " + request.getEmail()));

        // Generate unique token
        String token = UUID.randomUUID().toString();

        // Create password reset token
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiryTime(LocalDateTime.now().plusMinutes(30))
                .used(false)
                .build();

        passwordResetTokenRepository.save(resetToken);

        // Temporary: Print reset link to console
        System.out.println("=======================================");
        System.out.println("Password Reset Link:");
        System.out.println("http://localhost:5173/reset-password?token=" + token);
        System.out.println("=======================================");

        return "Password reset link generated successfully.";
    }

   @Override
public String googleLogin(GoogleLoginRequest request) {

    User user = userRepository.findByEmail("googleuser@gmail.com")
            .orElse(null);

    if (user == null) {

        user = User.builder()
                .name("Google User")
                .email("googleuser@gmail.com")
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .role(com.realestate.duediligence.enums.Role.valueOf(request.getRole()))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
    }

    return jwtService.generateToken(user.getEmail());
}
}