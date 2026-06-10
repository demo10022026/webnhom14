package com.ecommerce.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final ObjectMapper objectMapper;

    @Value("${app.email.provider:gmail-api}")
    private String emailProvider;

    @Value("${app.email.mailjet.api-key:}")
    private String mailjetApiKey;

    @Value("${app.email.mailjet.secret-key:}")
    private String mailjetSecretKey;

    @Value("${app.email.from-email:}")
    private String fromEmail;

    @Value("${app.email.from-name:ShopVN}")
    private String fromName;

    @Value("${app.email.gmail.client-id:}")
    private String gmailClientId;

    @Value("${app.email.gmail.client-secret:}")
    private String gmailClientSecret;

    @Value("${app.email.gmail.refresh-token:}")
    private String gmailRefreshToken;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Async
    public void sendOtpEmail(String toEmail, String otp, String purpose) {
        try {
            String subject = getSubject(purpose);
            String html = buildHtml(otp, purpose);
            if ("mailjet".equalsIgnoreCase(emailProvider)) {
                sendWithMailjet(toEmail, subject, html);
            } else {
                sendWithGmailApi(toEmail, subject, html);
            }
            log.info("Đã gửi OTP email đến: {}", toEmail);
        } catch (Exception e) {
            log.error("Lỗi gửi email đến {}: {}", toEmail, e.getMessage());
        }
    }

    private void sendWithGmailApi(String toEmail, String subject, String html) throws Exception {
        if (gmailClientId == null || gmailClientId.isBlank()) {
            throw new IllegalStateException("GMAIL_CLIENT_ID chưa được cấu hình");
        }
        if (gmailClientSecret == null || gmailClientSecret.isBlank()) {
            throw new IllegalStateException("GMAIL_CLIENT_SECRET chưa được cấu hình");
        }
        if (gmailRefreshToken == null || gmailRefreshToken.isBlank()) {
            throw new IllegalStateException("GMAIL_REFRESH_TOKEN chưa được cấu hình");
        }
        if (fromEmail == null || fromEmail.isBlank()) {
            throw new IllegalStateException("MAIL_FROM_EMAIL chưa được cấu hình");
        }

        String accessToken = fetchGmailAccessToken();
        String rawMessage = buildRawMimeMessage(toEmail, subject, html);

        Map<String, Object> payload = Map.of("raw", rawMessage);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://gmail.googleapis.com/gmail/v1/users/me/messages/send"))
                .timeout(Duration.ofSeconds(20))
                .header("authorization", "Bearer " + accessToken)
                .header("content-type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Gmail API trả HTTP " + response.statusCode() + ": " + response.body());
        }
    }

    private String fetchGmailAccessToken() throws Exception {
        String form = new StringJoiner("&")
                .add("client_id=" + urlEncode(gmailClientId))
                .add("client_secret=" + urlEncode(gmailClientSecret))
                .add("refresh_token=" + urlEncode(gmailRefreshToken))
                .add("grant_type=refresh_token")
                .toString();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://oauth2.googleapis.com/token"))
                .timeout(Duration.ofSeconds(20))
                .header("content-type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Google OAuth trả HTTP " + response.statusCode() + ": " + response.body());
        }

        Map<?, ?> tokenResponse = objectMapper.readValue(response.body(), Map.class);
        Object accessToken = tokenResponse.get("access_token");
        if (accessToken == null || accessToken.toString().isBlank()) {
            throw new IllegalStateException("Google OAuth không trả access_token");
        }
        return accessToken.toString();
    }

    private String buildRawMimeMessage(String toEmail, String subject, String html) {
        String from = "%s <%s>".formatted(fromName, fromEmail);
        String mime = """
                From: %s
                To: %s
                Subject: %s
                MIME-Version: 1.0
                Content-Type: text/html; charset=UTF-8
                Content-Transfer-Encoding: 8bit

                %s
                """.formatted(from, toEmail, subject, html);
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(mime.replace("\n", "\r\n").getBytes(StandardCharsets.UTF_8));
    }

    private String urlEncode(String value) {
        return java.net.URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private void sendWithMailjet(String toEmail, String subject, String html) throws Exception {
        if (mailjetApiKey == null || mailjetApiKey.isBlank()) {
            throw new IllegalStateException("MAILJET_API_KEY hoặc MAIL_USERNAME chưa được cấu hình");
        }
        if (mailjetSecretKey == null || mailjetSecretKey.isBlank()) {
            throw new IllegalStateException("MAILJET_SECRET_KEY hoặc MAIL_PASSWORD chưa được cấu hình");
        }
        if (fromEmail == null || fromEmail.isBlank()) {
            throw new IllegalStateException("MAIL_FROM_EMAIL chưa được cấu hình");
        }

        Map<String, Object> payload = Map.of(
                "Messages", List.of(Map.of(
                        "From", Map.of(
                                "Email", fromEmail,
                                "Name", fromName
                        ),
                        "To", List.of(Map.of("Email", toEmail)),
                        "Subject", subject,
                        "HTMLPart", html
                ))
        );

        String credentials = mailjetApiKey + ":" + mailjetSecretKey;
        String basicAuth = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.mailjet.com/v3.1/send"))
                .timeout(Duration.ofSeconds(20))
                .header("accept", "application/json")
                .header("authorization", "Basic " + basicAuth)
                .header("content-type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("Mailjet trả HTTP " + response.statusCode() + ": " + response.body());
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
