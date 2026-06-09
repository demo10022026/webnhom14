package com.ecommerce.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.payment.sepay")
public class SePayProperties {

    private boolean enabled = false;
    private boolean devSimulateEnabled = false;
    private String bankName;
    private String accountNumber;
    private String accountHolder;
    private String apiKey;
    private String qrTemplate = "compact";
}
