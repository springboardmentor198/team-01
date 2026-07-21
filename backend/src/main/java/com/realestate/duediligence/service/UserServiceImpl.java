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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import com.realestate.duediligence.dto.GoogleLoginRequest;
import com.realestate.duediligence.dto.GoogleLoginResponse;

import java.time.LocalDateTime;
import java.util.Map;
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

    @Value("${google.client.id}")
    private String googleClientId;

    @Value("${google.client.secret}")
    private String googleClientSecret;

    @Value("${google.redirect.uri}")
    private String googleRedirectUri;

    private final RestTemplate restTemplate = new RestTemplate();

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

        // Step 1: exchange the authorization code for Google tokens
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", request.getCode());
        body.add("client_id", googleClientId);
        body.add("client_secret", googleClientSecret);
        body.add("redirect_uri", googleRedirectUri);
        body.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(body, headers);

        Map<String, Object> tokenResponse = restTemplate.postForObject(
                "https://oauth2.googleapis.com/token",
                tokenRequest,
                Map.class
        );

        if (tokenResponse == null || tokenResponse.get("access_token") == null) {
            throw new RuntimeException("Failed to exchange Google authorization code");
        }

        String accessToken = (String) tokenResponse.get("access_token");

        // Step 2: use the access token to fetch the real Google profile
        HttpHeaders userInfoHeaders = new HttpHeaders();
        userInfoHeaders.setBearerAuth(accessToken);
        HttpEntity<Void> userInfoRequest = new HttpEntity<>(userInfoHeaders);

        Map<String, Object> googleProfile = restTemplate.exchange(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                HttpMethod.GET,
                userInfoRequest,
                Map.class
        ).getBody();

        if (googleProfile == null || googleProfile.get("email") == null) {
            throw new RuntimeException("Failed to fetch Google user profile");
        }

        String email = (String) googleProfile.get("email");
        String name = (String) googleProfile.get("name");
        String picture = (String) googleProfile.get("picture");

        // Step 3: find-or-create the user using the REAL Google email, not a hardcoded one
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = User.builder()
                    .name(name != null ? name : email.split("@")[0])
                    .email(email)
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .avatarUrl(picture)
                    .role(com.realestate.duediligence.enums.Role.valueOf(request.getRole()))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            userRepository.save(user);
        }

        return jwtService.generateToken(user.getEmail());
    }
}
