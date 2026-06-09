package com.ecommerce.service;

import com.ecommerce.dto.request.SePaySimulatePaymentRequest;
import com.ecommerce.dto.request.SePayWebhookRequest;
import com.ecommerce.dto.response.PaymentStatusResponse;

public interface PaymentService {

    PaymentStatusResponse getStatus(String email, Integer paymentId);

    PaymentStatusResponse handleSePayWebhook(String authorization, SePayWebhookRequest request);

    PaymentStatusResponse simulateSePayPayment(String email, SePaySimulatePaymentRequest request);
}
