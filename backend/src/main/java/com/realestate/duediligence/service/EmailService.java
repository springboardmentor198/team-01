package com.realestate.duediligence.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String fromAddress;

    /**
     * Legacy OTP sender
     */
    public void sendOtp(String email, String otp) {
        sendHtmlOtpEmail(
                email,
                "🔐 Password Reset OTP",
                "Password Reset Request",
                otp,
                5
        );
    }

    /**
     * Forgot Password OTP sender
     */
    public void sendPasswordResetOtp(String email, String otp) {
        sendHtmlOtpEmail(
                email,
                "🔐 Password Reset OTP",
                "Password Reset Request",
                otp,
                15
        );
    }

    /**
     * Sends Beautiful HTML OTP Email
     */
    private void sendHtmlOtpEmail(
            String email,
            String subject,
            String heading,
            String otp,
            int expiryMinutes
    ) {

        try {

            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            if (fromAddress != null && !fromAddress.isBlank()) {
                helper.setFrom(fromAddress, "Real Estate Due Diligence");
            }

            helper.setTo(email);
            helper.setSubject(subject);

            String html = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                    
                    <meta charset="UTF-8">
                    
                    <style>
                    
                    body{
                        margin:0;
                        padding:0;
                        background:#f3f6fb;
                        font-family:Arial,Helvetica,sans-serif;
                    }
                    
                    .container{
                        max-width:650px;
                        margin:40px auto;
                        background:#ffffff;
                        border-radius:12px;
                        overflow:hidden;
                        box-shadow:0 8px 25px rgba(0,0,0,0.08);
                    }
                    
                    .header{
                        background:linear-gradient(90deg,#2563eb,#1d4ed8);
                        color:white;
                        padding:28px;
                        text-align:center;
                    }
                    
                    .header h1{
                        margin:0;
                        font-size:28px;
                    }
                    
                    .content{
                        padding:40px;
                    }
                    
                    .content h2{
                        color:#222;
                        margin-top:0;
                    }
                    
                    .content p{
                        color:#555;
                        line-height:1.7;
                        font-size:16px;
                    }
                    
                    .otp-box{
                        margin:35px auto;
                        width:240px;
                        background:#2563eb;
                        color:white;
                        text-align:center;
                        font-size:34px;
                        font-weight:bold;
                        letter-spacing:8px;
                        padding:18px;
                        border-radius:10px;
                    }
                    
                    .info{
                        background:#f8fafc;
                        border-left:5px solid #2563eb;
                        padding:18px;
                        border-radius:8px;
                        margin-top:25px;
                    }
                    
                    .warning{
                        color:#dc2626;
                        font-weight:bold;
                    }
                    
                    .footer{
                        background:#f8f9fb;
                        text-align:center;
                        color:#777;
                        padding:22px;
                        font-size:13px;
                    }
                    
                    .divider{
                        height:1px;
                        background:#e5e7eb;
                        margin:35px 0;
                    }
                    
                    </style>
                    
                    </head>
                    
                    <body>
                    
                    <div class="container">
                    
                        <div class="header">
                            <h1>🏠 Real Estate Due Diligence</h1>
                            <p>Secure Account Verification</p>
                        </div>
                    
                        <div class="content">
                    
                            <h2>%s</h2>
                    
                            <p>Hello,</p>
                    
                            <p>
                            We received a request to reset the password
                            for your account.
                            </p>
                    
                            <p>
                            Please use the One-Time Password (OTP)
                            below to continue.
                            </p>
                    
                            <div class="otp-box">
                                %s
                            </div>
                    
                            <div class="info">
                                ⏳
                                <b>This OTP is valid for %d minutes.</b>
                                <br><br>
                                It can only be used once.
                            </div>
                    
                            <div class="divider"></div>
                    
                            <p class="warning">
                                🔒 Never share this OTP with anyone.
                            </p>
                    
                            <p>
                            If you did not request a password reset,
                            you can safely ignore this email.
                            Your account will remain secure.
                            </p>
                    
                            <p>
                            Regards,<br>
                            <b>Real Estate Due Diligence Team</b>
                            </p>
                    
                        </div>
                    
                        <div class="footer">
                    
                            © 2026 Real Estate Due Diligence
                            <br><br>
                            This is an automated email.
                            Please do not reply.
                    
                        </div>
                    
                    </div>
                    
                    </body>
                    </html>
                    """.formatted(
                    heading,
                    otp,
                    expiryMinutes
            );

            helper.setText(html, true);

            mailSender.send(message);

            System.out.println("✅ HTML Email sent successfully to: " + email);

        } catch (Exception e) {

            System.err.println("❌ Failed to send email");

            e.printStackTrace();

            throw new RuntimeException("Unable to send email", e);

        }

    }

}