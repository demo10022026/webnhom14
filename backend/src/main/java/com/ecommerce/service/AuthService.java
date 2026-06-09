package com.ecommerce.service;

import com.ecommerce.dto.request.*;
import com.ecommerce.dto.response.AuthResponse;
import org.springframework.web.multipart.MultipartFile;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    void logout(String refreshToken);

    // ---- OTP / Verification ----
    void sendEmailVerifyOtp(String email);

    void verifyEmail(String email, String otp);

    void sendForgotPasswordOtp(String email);

    void resetPassword(ResetPasswordRequest request);

    void changePassword(String email, ChangePasswordRequest request);

    AuthResponse.UserInfo updateAvatar(String email, MultipartFile avatar);
}
