package com.ims.service.serviceInterface.email;


public interface EmailService {
    void sendWelcomeEmail(String toEmail, String name);
    void sendResetOtpEmail(String toEmail, String otp);
    void sendOtpEmail(String toEmail, String otp);

}
