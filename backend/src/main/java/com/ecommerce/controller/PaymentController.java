package com.ecommerce.controller;

import com.ecommerce.dto.request.SePaySimulatePaymentRequest;
import com.ecommerce.dto.request.SePayWebhookRequest;
import com.ecommerce.dto.response.PaymentStatusResponse;
import com.ecommerce.exception.AppException;
import com.ecommerce.service.PaymentService;
import com.ecommerce.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/{paymentId}/status")
    public ApiResponse<PaymentStatusResponse> getStatus(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Integer paymentId
    ) {
        return ApiResponse.success(paymentService.getStatus(
                requireEmail(user),
                paymentId
        ));
    }

    @PostMapping("/sepay/webhook")
    public ApiResponse<PaymentStatusResponse> handleSePayWebhook(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @RequestBody SePayWebhookRequest request
    ) {
        return ApiResponse.success(
                "Đã ghi nhận thanh toán SePay",
                paymentService.handleSePayWebhook(authorization, request)
        );
    }

    @PostMapping("/sepay/simulate")
    public ApiResponse<PaymentStatusResponse> simulateSePayPayment(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody SePaySimulatePaymentRequest request
    ) {
        return ApiResponse.success(
                "Đã mô phỏng thanh toán SePay",
                paymentService.simulateSePayPayment(requireEmail(user), request)
        );
    }

    private String requireEmail(UserDetails user) {
        if (user == null) {
            throw new AppException(
                    "Phiên đăng nhập đã hết hạn",
                    HttpStatus.UNAUTHORIZED,
                    "UNAUTHORIZED"
            );
        }

        return user.getUsername();
    }
}
