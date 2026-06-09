package com.ecommerce.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class CheckoutPlaceOrderResponse {
    private Integer orderId;
    private String orderCode;
    private BigDecimal totalAmount;
    private String orderStatus;
    private PaymentInfo payment;

    @Getter
    @Builder
    public static class PaymentInfo {
        private Integer paymentId;
        private String paymentMethod;
        private String paymentStatus;
        private String transactionCode;
        private String qrCodeUrl;
    }
}
