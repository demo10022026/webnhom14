package com.ecommerce.service.impl;

import com.ecommerce.config.SePayProperties;
import com.ecommerce.dto.request.SePaySimulatePaymentRequest;
import com.ecommerce.dto.request.SePayWebhookRequest;
import com.ecommerce.dto.response.PaymentStatusResponse;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.Payment;
import com.ecommerce.entity.User;
import com.ecommerce.exception.AppException;
import com.ecommerce.repository.PaymentRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final String SEPAY_AUTH_PREFIX = "apikey ";

    private final PaymentRepository paymentRepo;
    private final UserRepository userRepo;
    private final SePayProperties sePayProperties;

    @Override
    @Transactional(readOnly = true)
    public PaymentStatusResponse getStatus(String email, Integer paymentId) {
        User user = findUser(email);
        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> AppException.notFound("Thanh toán"));

        assertPaymentOwner(payment, user);

        return toResponse(payment);
    }

    @Override
    @Transactional
    public PaymentStatusResponse handleSePayWebhook(
            String authorization,
            SePayWebhookRequest request
    ) {
        validateWebhookAuth(authorization);

        if (request == null || !"in".equalsIgnoreCase(clean(request.getTransferType()))) {
            throw new AppException(
                    "Webhook không phải giao dịch tiền vào",
                    HttpStatus.BAD_REQUEST,
                    "INVALID_SEPAY_TRANSFER"
            );
        }

        Payment payment = findPaymentFromWebhook(request);
        BigDecimal expectedAmount = safeMoney(payment.getOrder().getTotalAmount());
        BigDecimal receivedAmount = safeMoney(request.getTransferAmount());

        if (receivedAmount.compareTo(expectedAmount) < 0) {
            throw new AppException(
                    "Số tiền chuyển khoản chưa đủ",
                    HttpStatus.BAD_REQUEST,
                    "SEPAY_AMOUNT_NOT_ENOUGH"
            );
        }

        markPaid(payment);

        return toResponse(paymentRepo.save(payment));
    }

    @Override
    @Transactional
    public PaymentStatusResponse simulateSePayPayment(
            String email,
            SePaySimulatePaymentRequest request
    ) {
        if (!sePayProperties.isDevSimulateEnabled()) {
            throw new AppException(
                    "Chức năng mô phỏng thanh toán đang tắt",
                    HttpStatus.FORBIDDEN,
                    "SEPAY_SIMULATE_DISABLED"
            );
        }

        User user = findUser(email);
        String transactionCode = request == null ? null : clean(request.getTransactionCode());

        if (transactionCode == null) {
            throw new AppException(
                    "Thiếu mã thanh toán",
                    HttpStatus.BAD_REQUEST,
                    "SEPAY_TRANSACTION_CODE_REQUIRED"
            );
        }

        Payment payment = paymentRepo.findByTransactionCode(transactionCode)
                .orElseThrow(() -> AppException.notFound("Thanh toán"));

        assertPaymentOwner(payment, user);
        markPaid(payment);

        return toResponse(paymentRepo.save(payment));
    }

    private Payment findPaymentFromWebhook(SePayWebhookRequest request) {
        String code = clean(request.getCode());
        if (code != null) {
            return paymentRepo.findByTransactionCode(code)
                    .orElseGet(() -> findPaymentByContent(request));
        }

        return findPaymentByContent(request);
    }

    private Payment findPaymentByContent(SePayWebhookRequest request) {
        String content = clean(request.getContent());

        if (content == null) {
            throw new AppException(
                    "Webhook không có nội dung chuyển khoản",
                    HttpStatus.BAD_REQUEST,
                    "SEPAY_CONTENT_REQUIRED"
            );
        }

        return paymentRepo.findByTransactionCodeInContent(content)
                .stream()
                .findFirst()
                .orElseThrow(() -> AppException.notFound("Thanh toán"));
    }

    private void markPaid(Payment payment) {
        if (payment.getPaymentStatus() == Payment.PaymentStatus.paid) {
            return;
        }

        if (!isSePayPayment(payment)) {
            throw new AppException(
                    "Thanh toán không thuộc SePay",
                    HttpStatus.BAD_REQUEST,
                    "INVALID_PAYMENT_PROVIDER"
            );
        }

        payment.setPaymentStatus(Payment.PaymentStatus.paid);
        payment.setPaidAt(LocalDateTime.now());

        Order order = payment.getOrder();
        if (order.getOrderStatus() == Order.OrderStatus.pending) {
            order.setOrderStatus(Order.OrderStatus.processing);
        }
    }

    private void validateWebhookAuth(String authorization) {
        String configuredKey = clean(sePayProperties.getApiKey());

        if (configuredKey == null) {
            return;
        }

        String header = clean(authorization);
        String expected = SEPAY_AUTH_PREFIX + configuredKey;

        if (header == null || !header.toLowerCase(Locale.ROOT).equals(expected.toLowerCase(Locale.ROOT))) {
            throw new AppException(
                    "Webhook SePay không hợp lệ",
                    HttpStatus.UNAUTHORIZED,
                    "INVALID_SEPAY_WEBHOOK_AUTH"
            );
        }
    }

    private void assertPaymentOwner(Payment payment, User user) {
        if (
                payment.getOrder() == null
                        || payment.getOrder().getUser() == null
                        || !payment.getOrder().getUser().getUserId().equals(user.getUserId())
        ) {
            throw AppException.forbidden();
        }
    }

    private PaymentStatusResponse toResponse(Payment payment) {
        Order order = payment.getOrder();

        return PaymentStatusResponse.builder()
                .paymentId(payment.getPaymentId())
                .orderId(order.getOrderId())
                .orderCode(toOrderCode(order.getOrderId()))
                .totalAmount(order.getTotalAmount())
                .paymentMethod(toClientPaymentMethod(payment))
                .paymentStatus(payment.getPaymentStatus().name())
                .transactionCode(payment.getTransactionCode())
                .qrCodeUrl(buildQrCodeUrl(payment))
                .paidAt(payment.getPaidAt())
                .build();
    }

    private String buildQrCodeUrl(Payment payment) {
        if (!isSePayPayment(payment)) {
            return null;
        }

        if (!sePayProperties.isEnabled()) {
            return null;
        }

        String accountNumber = clean(sePayProperties.getAccountNumber());
        String bankName = clean(sePayProperties.getBankName());

        if (accountNumber == null || bankName == null) {
            return null;
        }

        BigDecimal amount = safeMoney(payment.getOrder().getTotalAmount())
                .setScale(0, RoundingMode.HALF_UP);

        return "https://qr.sepay.vn/img"
                + "?acc=" + encode(accountNumber)
                + "&bank=" + encode(bankName)
                + "&amount=" + encode(amount.toPlainString())
                + "&des=" + encode(payment.getTransactionCode())
                + "&template=" + encode(clean(sePayProperties.getQrTemplate()) == null
                ? "compact"
                : clean(sePayProperties.getQrTemplate()));
    }

    private boolean isSePayPayment(Payment payment) {
        return payment.getTransactionCode() != null
                && payment.getTransactionCode().startsWith("SP")
                && (
                payment.getPaymentMethod() == Payment.PaymentMethod.sepay
                        || payment.getPaymentMethod() == Payment.PaymentMethod.bank_transfer
        );
    }

    private String toClientPaymentMethod(Payment payment) {
        return isSePayPayment(payment)
                ? "sepay"
                : payment.getPaymentMethod().name();
    }

    private User findUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> AppException.notFound("User"));
    }

    private String toOrderCode(Integer orderId) {
        if (orderId == null) {
            return "DH000000";
        }

        return "DH" + String.format("%06d", orderId);
    }

    private BigDecimal safeMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String clean(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
