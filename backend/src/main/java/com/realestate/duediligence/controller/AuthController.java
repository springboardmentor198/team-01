package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.ForgotPasswordRequest;
import com.realestate.duediligence.dto.LoginRequest;
import com.realestate.duediligence.dto.RegisterRequest;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.realestate.duediligence.dto.GoogleLoginRequest;
import com.realestate.duediligence.dto.GoogleLoginResponse;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        User user = userService.register(request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @GetMapping("/reset")
    public ResponseEntity<String> resetUser(@RequestParam String email) {
        userRepository.findByEmail(email).ifPresent(user -> userRepository.delete(user));
        return ResponseEntity.ok("User reset successfully");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {

        String response = userService.forgotPassword(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
public ResponseEntity<String> googleLogin(
        @RequestBody GoogleLoginRequest request) {

    return ResponseEntity.ok(userService.googleLogin(request));
}
}