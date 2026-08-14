package com.ims.service.impl.email;

import com.ims.service.serviceInterface.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;


    @Value("${mail.from}")
    private String fromEmail;

    public void sendWelcomeEmail(String toEmail, String name) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Welcome to our Platform");
        message.setText(
                "Hello " + name +
                        "\n\nThanks for registering with us!" +
                        "\n\nRegards," +
                        "\nAuthify Team"
        );

        mailSender.send(message);
    }

    public void sendResetOtpEmail(String toEmail, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Password Reset OTP");
        message.setText("Your otp for resetting your password is " + otp + ".Use this OTP to proceed with reset");
        mailSender.send(message);
    }

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Account verification OTP");
        message.setText("Your OTP is " + otp + ".Verify your account using this OTP");
        mailSender.send(message);
    }
}