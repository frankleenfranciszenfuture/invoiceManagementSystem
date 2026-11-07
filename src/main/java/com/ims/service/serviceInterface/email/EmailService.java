package com.ims.service.serviceInterface.email;


import org.springframework.web.multipart.MultipartFile;

public interface EmailService {

    void sendWelcomeEmail(String toEmail, String name);

    void sendResetOtpEmail(String toEmail, String otp);

    void sendOtpEmail(String toEmail, String otp);

    // Send invoice email with PDF attachment
    void sendInvoiceEmail(
            String toEmail,
            String subject,
            String message,
            String invoiceNumber,
            MultipartFile pdfFile
    );
}