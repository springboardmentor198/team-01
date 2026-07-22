package com.realestate.duediligence.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String fromAddress;

    public void sendOtp(String email,String otp){

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);

        message.setSubject("Password Reset OTP");

        message.setText(
                "Hello,\n\n" +
                "Your OTP for password reset is : "
                        + otp +
                        "\n\nThis OTP is valid for 5 minutes.\n\n" +
                        "Do not share this OTP with anyone."
        );

        send(message);
    }

    /** Sends the OTP used by the /forgot-password and /reset-password flow. */
    public void sendPasswordResetOtp(String email, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password reset OTP");
        message.setText(
                "Hello,\n\n" +
                "Use this OTP to reset your password: " + otp + "\n\n" +
                "It expires in 15 minutes and can be used only once. " +
                "Do not share it with anyone."
        );
        send(message);
    }

    private void send(SimpleMailMessage message) {
    try {
        if (fromAddress != null && !fromAddress.isBlank()) {
            message.setFrom(fromAddress);
        }

        mailSender.send(message);
        System.out.println("✅ Email sent successfully to: " + message.getTo()[0]);

    } catch (Exception e) {
        System.err.println("❌ Email sending failed");
        e.printStackTrace();
        throw e;
    }
}

}
