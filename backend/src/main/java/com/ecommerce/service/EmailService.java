package com.ecommerce.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final ObjectMapper objectMapper;

    @Value("${app.email.provider:smtp}")
    private String emailProvider;

    @Value("${app.email.brevo.api-key:}")
    private String brevoApiKey;

    @Value("${app.email.brevo.sender-email:}")
    private String brevoSenderEmail;

    @Value("${app.email.brevo.sender-name:ShopVN}")
    private String brevoSenderName;

    @Value("${app.email.resend.api-key:}")
    private String resendApiKey;

    @Value("${app.email.resend.from-email:}")
    private String resendFromEmail;

    @Value("${app.email.resend.from-name:ShopVN}")
    private String resendFromName;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Async
    public void sendOtpEmail(String toEmail, String otp, String purpose) {
        try {
            String subject = getSubject(purpose);
            String html = buildHtml(otp, purpose);
            if ("brevo".equalsIgnoreCase(emailProvider)) {
                sendWithBrevo(toEmail, subject, html);
            } else if ("resend".equalsIgnoreCase(emailProvider)) {
                sendWithResend(toEmail, subject, html);
            } else {
                sendWithSmtp(toEmail, subject, html);
            }
            log.info("Đã gửi OTP email đến: {}", toEmail);
        } catch (Exception e) {
            log.error("Lỗi gửi email đến {}: {}", toEmail, e.getMessage());
        }
    }

    private void sendWithSmtp(String toEmail, String subject, String html) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(html, true);

        mailSender.send(message);
    }

    private void sendWithBrevo(String toEmail, String subject, String html) throws Exception {
        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            throw new IllegalStateException("BREVO_API_KEY chưa được cấu hình");
        }
        if (brevoSenderEmail == null || brevoSenderEmail.isBlank()) {
            throw new IllegalStateException("BREVO_SENDER_EMAIL chưa được cấu hình");
        }

        Map<String, Object> payload = Map.of(
                "sender", Map.of(
                        "name", brevoSenderName,
                        "email", brevoSenderEmail
                ),
                "to", List.of(Map.of("email", toEmail)),
                "subject", subject,
                "htmlContent", html
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                .timeout(Duration.ofSeconds(20))
                .header("accept", "application/json")
                .header("api-key", brevoApiKey)
                .header("content-type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Brevo trả HTTP " + response.statusCode() + ": " + response.body());
        }
    }

    private void sendWithResend(String toEmail, String subject, String html) throws Exception {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            throw new IllegalStateException("RESEND_API_KEY chưa được cấu hình");
        }
        if (resendFromEmail == null || resendFromEmail.isBlank()) {
            throw new IllegalStateException("RESEND_FROM_EMAIL chưa được cấu hình");
        }

        Map<String, Object> payload = Map.of(
                "from", "%s <%s>".formatted(resendFromName, resendFromEmail),
                "to", List.of(toEmail),
                "subject", subject,
                "html", html
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .timeout(Duration.ofSeconds(20))
                .header("accept", "application/json")
                .header("authorization", "Bearer " + resendApiKey)
                .header("content-type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Resend trả HTTP " + response.statusCode() + ": " + response.body());
        }
    }

    private String getSubject(String purpose) {
        return switch (purpose) {
            case "FORGOT_PASSWORD" -> "[ShopVN] Mã đặt lại mật khẩu";
            case "EMAIL_VERIFY"    -> "[ShopVN] Xác nhận email của bạn";
            case "PHONE_VERIFY"    -> "[ShopVN] Xác nhận số điện thoại";
            default                -> "[ShopVN] Mã xác thực OTP";
        };
    }

    private String buildHtml(String otp, String purpose) {
        String action = switch (purpose) {
            case "FORGOT_PASSWORD" -> "đặt lại mật khẩu";
            case "EMAIL_VERIFY"    -> "xác nhận email";
            default                -> "xác thực tài khoản";
        };
        return """
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;
                        border:1px solid #eee;border-radius:12px;">
              <h2 style="color:#f97316;margin-bottom:8px;">ShopVN</h2>
              <p style="color:#555;">Mã OTP để <strong>%s</strong> của bạn là:</p>
              <div style="font-size:40px;font-weight:bold;letter-spacing:12px;
                          color:#111;text-align:center;padding:20px 0;">%s</div>
              <p style="color:#999;font-size:13px;">Mã có hiệu lực trong <strong>5 phút</strong>.
                 Không chia sẻ mã này với bất kỳ ai.</p>
            </div>
            """.formatted(action, otp);
    }
}
