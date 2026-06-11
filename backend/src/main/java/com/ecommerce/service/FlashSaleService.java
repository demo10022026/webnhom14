package com.ecommerce.service;

import com.ecommerce.entity.FlashSaleItem;
import com.ecommerce.entity.ProductVariant;
import com.ecommerce.exception.AppException;
import com.ecommerce.repository.FlashSaleRepository;
import com.ecommerce.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.data.domain.PageRequest;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FlashSaleService {

    private final FlashSaleRepository flashSaleRepository;
    private final ProductVariantRepository productVariantRepository;

    @Value("${app.flash-sale.enabled:true}")
    private boolean enabled;

    @Value("${app.flash-sale.slot-hours:2}")
    private int slotHours;

    @Value("${app.flash-sale.item-count:8}")
    private int itemCount;

    @Value("${app.flash-sale.quantity-limit:50}")
    private int defaultQuantityLimit;

    @Value("${app.flash-sale.min-discount-percent:5}")
    private int minDiscountPercent;

    @Value("${app.flash-sale.max-discount-percent:25}")
    private int maxDiscountPercent;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeCurrentSlot() {
        ensureCurrentSlot();
    }

    @Scheduled(fixedDelayString = "${app.flash-sale.refresh-delay-ms:300000}")
    @Transactional
    public void refreshCurrentSlot() {
        ensureCurrentSlot();
    }

    public void ensureCurrentSlot() {
        if (!enabled) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        flashSaleRepository.deactivateExpired(now);

        if (flashSaleRepository.countAvailableActiveFlashSales(now) > 0) {
            return;
        }

        LocalDateTime start = currentSlotStart(now);
        LocalDateTime end = start.plusHours(safeSlotHours());

        List<ProductVariant> candidates = productVariantRepository.findFlashSaleCandidates(
                PageRequest.of(0, Math.max(itemCount * 3, itemCount))
        );

        int created = 0;

        for (ProductVariant variant : candidates) {
            if (created >= itemCount) {
                break;
            }

            if (variant.getProduct() == null || variant.getPrice() == null) {
                continue;
            }

            if (flashSaleRepository
                    .findFirstByVariantVariantIdAndStartTimeAndEndTime(
                            variant.getVariantId(),
                            start,
                            end
                    )
                    .isPresent()) {
                continue;
            }

            int discountPercent = discountForVariant(variant, created);
            BigDecimal salePrice = calculateSalePrice(variant.getPrice(), discountPercent);

            if (salePrice.compareTo(BigDecimal.ZERO) <= 0
                    || salePrice.compareTo(variant.getPrice()) >= 0) {
                continue;
            }

            int stockQuantity = safeInt(variant.getStockQuantity());
            int quantityLimit = Math.max(
                    1,
                    Math.min(defaultQuantityLimit, stockQuantity)
            );

            FlashSaleItem item = FlashSaleItem.builder()
                    .product(variant.getProduct())
                    .variant(variant)
                    .discountPercent(BigDecimal.valueOf(discountPercent))
                    .salePrice(salePrice)
                    .quantityLimit(quantityLimit)
                    .quantitySold(0)
                    .startTime(start)
                    .endTime(end)
                    .isActive(true)
                    .build();

            flashSaleRepository.save(item);
            created++;
        }
    }

    @Transactional(readOnly = true)
    public BigDecimal getEffectivePrice(ProductVariant variant) {
        if (variant == null) {
            return BigDecimal.ZERO;
        }

        FlashSaleItem item = findActiveItem(variant.getVariantId());

        if (item != null && item.getSalePrice() != null) {
            return item.getSalePrice();
        }

        return variant.getPrice();
    }

    @Transactional(readOnly = true)
    public FlashSaleItem findActiveItem(Integer variantId) {
        if (variantId == null) {
            return null;
        }

        return flashSaleRepository
                .findActiveByVariant(
                        variantId,
                        LocalDateTime.now(),
                        PageRequest.of(0, 1)
                )
                .stream()
                .findFirst()
                .orElse(null);
    }

    @Transactional
    public BigDecimal reserveIfActive(ProductVariant variant, int quantity) {
        if (variant == null) {
            return BigDecimal.ZERO;
        }

        FlashSaleItem item = findActiveItem(variant.getVariantId());

        if (item == null) {
            return variant.getPrice();
        }

        int rows = flashSaleRepository.increaseSoldIfAvailable(
                item.getId(),
                Math.max(quantity, 1),
                LocalDateTime.now()
        );

        if (rows == 0) {
            throw new AppException(
                    "Sản phẩm Flash Sale đã hết suất",
                    HttpStatus.BAD_REQUEST,
                    "FLASH_SALE_SOLD_OUT"
            );
        }

        return item.getSalePrice();
    }

    private LocalDateTime currentSlotStart(LocalDateTime now) {
        int hours = safeSlotHours();
        int slotHour = (now.getHour() / hours) * hours;

        return now.truncatedTo(ChronoUnit.DAYS).plusHours(slotHour);
    }

    private int safeSlotHours() {
        return Math.max(slotHours, 1);
    }

    private int discountForVariant(ProductVariant variant, int index) {
        int min = Math.max(minDiscountPercent, 1);
        int max = Math.max(maxDiscountPercent, min);
        int spread = max - min + 1;
        int seed = safeInt(variant.getVariantId()) + index * 7;

        return min + Math.floorMod(seed, spread);
    }

    private BigDecimal calculateSalePrice(BigDecimal price, int discountPercent) {
        BigDecimal raw = price.multiply(
                BigDecimal.valueOf(100L - discountPercent)
        ).divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN);

        BigDecimal rounded = raw.divide(
                BigDecimal.valueOf(1000),
                0,
                RoundingMode.DOWN
        ).multiply(BigDecimal.valueOf(1000));

        if (rounded.compareTo(BigDecimal.ZERO) <= 0) {
            return raw.max(BigDecimal.ONE);
        }

        return rounded;
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }
}
