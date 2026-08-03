package com.realestate.duediligence.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.realestate.duediligence.dto.ForgotPasswordResponse;
import com.realestate.duediligence.dto.GoogleLoginRequest;
import com.realestate.duediligence.dto.LoginRequest;
import com.realestate.duediligence.dto.RegisterRequest;
import com.realestate.duediligence.dto.ResetPasswordRequest;
import com.realestate.duediligence.entity.PasswordResetToken;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.event.NotificationEvents;
import com.realestate.duediligence.exception.BadRequestException;
import com.realestate.duediligence.exception.ConflictException;
import com.realestate.duediligence.repository.PasswordResetTokenRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.util.JwtService;

@Service
public class UserServiceImpl implements UserService {
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordResetTokenRepository passwordResetTokenRepository;
    @Autowired private EmailService emailService;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;
    @Autowired private ApplicationEventPublisher eventPublisher;

    @Value("${google.client.id}") private String googleClientId;
    @Value("${google.client.secret}") private String googleClientSecret;
    @Value("${google.redirect.uri}") private String googleRedirectUri;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public User register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException("Email already exists");
        }
        User user = User.builder()
                .name(request.getName()).email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .avatarUrl(request.getAvatarUrl()).role(Role.BUYER)
                .phoneNumber(request.getPhoneNumber()).createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now()).build();
        User saved = userRepository.save(user);
        eventPublisher.publishEvent(new NotificationEvents.UserRegisteredEvent(saved));
        return saved;
    }

    @Override
    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid Email"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid Password");
        }
        return jwtService.generateToken(user.getEmail());
    }

    @Override
    @Transactional
    public ForgotPasswordResponse requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return new ForgotPasswordResponse("If an account exists for this email address, an OTP has been sent.");
        }
        passwordResetTokenRepository.deleteByUser(user);
        String otp = generateOtp();
        passwordResetTokenRepository.save(PasswordResetToken.builder().user(user)
                .tokenHash(hashToken(otp)).expiresAt(LocalDateTime.now().plusMinutes(15)).build());
        emailService.sendPasswordResetOtp(user.getEmail(), otp);
        return new ForgotPasswordResponse("If an account exists for this email address, an OTP has been sent.");
    }

    @Override
    @Transactional
    public void verifyResetOtp(String email, String token) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new BadRequestException("User not found"));

        PasswordResetToken resetToken =
                passwordResetTokenRepository
                        .findByTokenHashAndUsedAtIsNull(hashToken(token))
                        .orElseThrow(() ->
                                new BadRequestException("Invalid OTP"));

        if (!resetToken.getUser().getUserId().equals(user.getUserId())) {

            throw new BadRequestException("Invalid OTP");

        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {

            throw new BadRequestException("OTP has expired.");

        }

        // Mark the OTP as verified so resetPassword can enforce that verification actually happened
        resetToken.setVerifiedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);

    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenHashAndUsedAtIsNull(hashToken(request.getToken()))
                .orElseThrow(() -> new BadRequestException("Invalid or already used reset token"));
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired. Please request a new one.");
        }
        if (resetToken.getVerifiedAt() == null) {
            throw new BadRequestException("OTP has not been verified for this reset request.");
        }
        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);
    }

    @Override
    public String googleLogin(GoogleLoginRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", request.getCode());
        body.add("client_id", googleClientId);
        body.add("client_secret", googleClientSecret);
        body.add("redirect_uri", googleRedirectUri);
        body.add("grant_type", "authorization_code");
        Map<String, Object> tokens = restTemplate.postForObject("https://oauth2.googleapis.com/token",
                new HttpEntity<>(body, headers), Map.class);
        if (tokens == null || tokens.get("access_token") == null) {
            throw new BadRequestException("Failed to exchange Google authorization code");
        }
        HttpHeaders profileHeaders = new HttpHeaders();
        profileHeaders.setBearerAuth((String) tokens.get("access_token"));
        Map<String, Object> profile = restTemplate.exchange("https://www.googleapis.com/oauth2/v3/userinfo",
                HttpMethod.GET, new HttpEntity<Void>(profileHeaders), Map.class).getBody();
        if (profile == null || profile.get("email") == null) {
            throw new BadRequestException("Failed to fetch Google user profile");
        }
        String email = (String) profile.get("email");
        User user = userRepository.findByEmail(email).orElseGet(() -> userRepository.save(User.builder()
                .name((String) profile.getOrDefault("name", email.substring(0, email.indexOf('@'))))
                .email(email).passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .avatarUrl((String) profile.get("picture")).role(Role.BUYER)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build()));
        return jwtService.generateToken(user.getEmail());
    }

    private String generateOtp() {
        return String.valueOf(100000 + new SecureRandom().nextInt(900000));
    }

    private String hashToken(String token) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder();
            for (byte value : hash) result.append(String.format("%02x", value));
            return result.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
