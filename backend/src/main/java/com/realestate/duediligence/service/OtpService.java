package com.realestate.duediligence.service;

import com.realestate.duediligence.entity.PasswordOtp;
import com.realestate.duediligence.repository.PasswordOtpRepository;
import com.realestate.duediligence.util.OtpGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class OtpService {

    @Autowired
    private PasswordOtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    public void sendOtp(String email){

        // Remove only this recipient's existing OTPs; do not load every OTP.
        otpRepository.deleteByEmail(email);

        String otp = OtpGenerator.generateOtp();

        PasswordOtp passwordOtp = PasswordOtp.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .verified(false)
                .build();

        otpRepository.save(passwordOtp);

        emailService.sendOtp(email,otp);
    }

}
