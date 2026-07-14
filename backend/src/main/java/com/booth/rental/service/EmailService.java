package com.booth.rental.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private static final String FROM_EMAIL = "nguyendangquang0510@gmail.com";
    private static final DateTimeFormatter VN_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final NumberFormat VN_CURRENCY = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(FROM_EMAIL);
            message.setTo(toEmail);
            message.setSubject("Mã xác nhận quên mật khẩu");
            message.setText("Mã OTP của bạn là: " + otp
                    + "\n\nMã này sẽ hết hạn trong 5 phút.\nVui lòng không chia sẻ mã này cho bất kỳ ai.");
            mailSender.send(message);
            log.info("Email sent successfully to {}", toEmail);
        } catch (MailException e) {
            log.error(
                    "Failed to send email to {}. If you haven't configured application.properties, here is the OTP: {}",
                    toEmail, otp);
            log.error("Mail exception: {}", e.getMessage());
            // We print the OTP so we can test the flow even if SMTP is not configured
            System.out.println("=================================================");
            System.out.println("MOCK EMAIL SENT TO: " + toEmail);
            System.out.println("OTP CODE: " + otp);
            System.out.println("=================================================");
        }
    }

    /**
     * Gửi email nhắc thanh toán trước hạn 3 ngày.
     */
    public void sendPaymentReminder(String toEmail, String customerName, String paymentTitle,
                                     BigDecimal amount, LocalDate dueDate) {
        String subject = "[BoothSpace] Nhắc nhở thanh toán - " + paymentTitle;
        String body = String.format(
                "Kính gửi %s,\n\n"
                + "Chúng tôi xin nhắc nhở bạn về khoản thanh toán sắp đến hạn:\n\n"
                + "📋 Nội dung: %s\n"
                + "💰 Số tiền: %s\n"
                + "📅 Hạn thanh toán: %s\n\n"
                + "Vui lòng thanh toán đúng hạn để tránh phát sinh phí phạt.\n"
                + "Nếu bạn đã thanh toán, vui lòng bỏ qua email này.\n\n"
                + "Trân trọng,\n"
                + "Đội ngũ BoothSpace",
                customerName, paymentTitle, VN_CURRENCY.format(amount), dueDate.format(VN_DATE)
        );
        sendSimpleEmail(toEmail, subject, body);
    }

    /**
     * Gửi email nhắc gia hạn hợp đồng trước khi hết hiệu lực 7 ngày.
     */
    public void sendContractRenewalReminder(String toEmail, String customerName,
                                             String contractNo, LocalDate endDate) {
        String subject = "[BoothSpace] Nhắc nhở gia hạn hợp đồng - " + contractNo;
        String body = String.format(
                "Kính gửi %s,\n\n"
                + "Hợp đồng thuê gian hàng của bạn sắp hết hiệu lực:\n\n"
                + "📄 Mã hợp đồng: %s\n"
                + "📅 Ngày hết hạn: %s\n\n"
                + "Nếu bạn muốn tiếp tục thuê, vui lòng liên hệ quản lý để gia hạn hợp đồng.\n"
                + "Sau ngày hết hạn, gian hàng sẽ được giải phóng cho khách hàng khác.\n\n"
                + "Trân trọng,\n"
                + "Đội ngũ BoothSpace",
                customerName, contractNo, endDate.format(VN_DATE)
        );
        sendSimpleEmail(toEmail, subject, body);
    }

    /**
     * Helper gửi email đơn giản với fallback mock log.
     */
    private void sendSimpleEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(FROM_EMAIL);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent successfully to {} - Subject: {}", toEmail, subject);
        } catch (MailException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
            System.out.println("=================================================");
            System.out.println("MOCK EMAIL SENT TO: " + toEmail);
            System.out.println("SUBJECT: " + subject);
            System.out.println("BODY:\n" + body);
            System.out.println("=================================================");
        }
    }
}
