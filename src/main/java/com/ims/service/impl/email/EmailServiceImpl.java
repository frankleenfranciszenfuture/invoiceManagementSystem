package com.ims.service.impl.email;

import com.ims.service.serviceInterface.email.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    private static final long MAX_PDF_SIZE = 10L * 1024L * 1024L;

    @Value("${mail.from}")
    private String fromEmail;

    // =====================================================
    // WELCOME EMAIL
    // =====================================================

    @Override
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

    // =====================================================
    // RESET OTP EMAIL
    // =====================================================

    @Override
    public void sendResetOtpEmail(String toEmail, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Password Reset OTP");
        message.setText(
                "Your otp for resetting your password is " +
                        otp +
                        ". Use this OTP to proceed with reset."
        );

        mailSender.send(message);
    }

    // =====================================================
    // ACCOUNT VERIFICATION OTP
    // =====================================================

    @Override
    public void sendOtpEmail(String toEmail, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Account verification OTP");
        message.setText(
                "Your OTP is " +
                        otp +
                        ". Verify your account using this OTP."
        );

        mailSender.send(message);
    }

    // =====================================================
    // INVOICE EMAIL WITH PDF ATTACHMENT
    // =====================================================

    @Override
    public void sendInvoiceEmail(
            String toEmail,
            String subject,
            String messageText,
            String invoiceNumber,
            MultipartFile pdfFile
    ) {

        validateInvoiceEmail(toEmail, pdfFile);

        try {

            byte[] pdfBytes = pdfFile.getBytes();

            MimeMessage mimeMessage = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(
                    mimeMessage,
                    true,
                    StandardCharsets.UTF_8.name()
            );

            String safeInvoiceNumber = invoiceNumber == null
                    ? "Invoice"
                    : invoiceNumber.replaceAll("[^a-zA-Z0-9_-]", "_");

            String fileName = safeInvoiceNumber + ".pdf";

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);

            helper.setSubject(
                    subject == null || subject.isBlank()
                            ? "Invoice " + safeInvoiceNumber
                            : subject.trim()
            );

            helper.setText(
                    messageText == null || messageText.isBlank()
                            ? "Please find your invoice attached.\n\nThank you."
                            : messageText,
                    false
            );

            helper.addAttachment(
                    fileName,
                    new ByteArrayResource(pdfBytes) {
                        @Override
                        public String getFilename() {
                            return fileName;
                        }
                    }
            );

            mailSender.send(mimeMessage);

        } catch (MessagingException | IOException exception) {

            throw new IllegalStateException(
                    "Unable to send invoice email.",
                    exception
            );
        }


    }

    // =====================================================
    // VALIDATE INVOICE EMAIL
    // =====================================================

    private void validateInvoiceEmail(
            String toEmail,
            MultipartFile pdfFile
    ) {

        if (toEmail == null || toEmail.isBlank()) {
            throw new IllegalArgumentException(
                    "Recipient email is required."
            );
        }

        if (!toEmail.matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
        )) {
            throw new IllegalArgumentException(
                    "Invalid recipient email address."
            );
        }

        if (pdfFile == null || pdfFile.isEmpty()) {
            throw new IllegalArgumentException(
                    "Invoice PDF attachment is required."
            );
        }

        if (pdfFile.getSize() > MAX_PDF_SIZE) {
            throw new IllegalArgumentException(
                    "Invoice PDF must not exceed 10 MB."
            );
        }

        try {

            byte[] bytes = pdfFile.getBytes();

            if (bytes.length < 5 ||
                    !new String(
                            bytes,
                            0,
                            5,
                            StandardCharsets.US_ASCII
                    ).equals("%PDF-")) {

                throw new IllegalArgumentException(
                        "Invalid PDF attachment."
                );
            }

        } catch (IOException exception) {

            throw new IllegalArgumentException(
                    "Unable to read invoice PDF attachment.",
                    exception
            );
        }
    }
}