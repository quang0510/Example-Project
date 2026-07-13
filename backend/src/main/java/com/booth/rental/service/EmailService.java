package com.booth.rental.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("nguyendangquang0510@gmail.com");
            message.setTo(toEmail);
            message.setSubject("Mã xác nhận quên mật khẩu");
            message.setText("Mã OTP của bạn là: " + otp + "\n\nMã này sẽ hết hạn trong 5 phút.\nVui lòng không chia sẻ mã này cho bất kỳ ai.");
            mailSender.send(message);
            log.info("Email sent successfully to {}", toEmail);
        } catch (MailException e) {
            log.error("Failed to send email to {}. If you haven't configured application.properties, here is the OTP: {}", toEmail, otp);
            log.error("Mail exception: {}", e.getMessage());
            // We print the OTP so we can test the flow even if SMTP is not configured
            System.out.println("=================================================");
            System.out.println("MOCK EMAIL SENT TO: " + toEmail);
            System.out.println("OTP CODE: " + otp);
            System.out.println("=================================================");
        }
    }
}
