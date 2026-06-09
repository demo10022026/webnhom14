package com.ecommerce.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentStatusResponse {

    private Integer paymentId;
    private Integer orderId;
    private String orderCode;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String transactionCode;
    private String qrCodeUrl;
    private LocalDateTime paidAt;
}
