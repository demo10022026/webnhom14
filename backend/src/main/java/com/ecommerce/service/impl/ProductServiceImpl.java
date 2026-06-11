package com.ecommerce.service.impl;

import com.ecommerce.dto.response.ProductDtos;
import com.ecommerce.entity.*;
import com.ecommerce.exception.AppException;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.FlashSaleRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.service.FlashSaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl {

    private final ProductRepository productRepository;
    private final FlashSaleRepository flashSaleRepository;
    private final CategoryRepository categoryRepository;
    private final FlashSaleService flashSaleService;

    // ---- Trang chủ ----

    public List<ProductDtos.ProductSummary> getNewProducts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);

        return productRepository
                .findByProductStatusOrderByCreatedAtDesc(
                        Product.Status.active,
                        pageable
                )
                .stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    public List<ProductDtos.ProductSummary> getBestSellers(int limit) {
        Pageable pageable = PageRequest.of(0, limit);

        return productRepository
                .findByProductStatusOrderBySoldCountDesc(
                        Product.Status.active,
                        pageable
                )
                .stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    public List<ProductDtos.FlashSaleProduct> getFlashSaleProducts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);

        return flashSaleRepository
                .findActiveFlashSales(LocalDateTime.now(), pageable)
                .stream()
                .map(this::toFlashSale)
                .collect(Collectors.toList());
    }

    // ---- Tìm kiếm / lọc ----

    public Page<ProductDtos.ProductSummary> searchProducts(
            String keyword,
            Integer parentCategoryId,
            Integer categoryId,
            Integer brandId,
            String shopName,
            String brandName,
            Long minPrice,
            Long maxPrice,
            String sort,
            int page,
            int size
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 60);

        String safeSort = normalizeSort(sort);

        Pageable pageable = PageRequest.of(safePage, safeSize);

        return productRepository
                .searchProductsForUser(
                        normalizeText(keyword),
                        parentCategoryId,
                        categoryId,
                        brandId,
                        normalizeText(shopName),
                        normalizeText(brandName),
                        minPrice,
                        maxPrice,
                        safeSort,
                        pageable
                )
                .map(this::toSummary);
    }

    // Giữ method cũ để code cũ không vỡ nếu ProductController đang gọi bản cũ.
    public Page<ProductDtos.ProductSummary> searchProducts(
            String keyword,
            Integer categoryId,
            Integer brandId,
            Long minPrice,
            Long maxPrice,
            String sort,
            int page,
            int size
    ) {
        return searchProducts(
                keyword,
                null,
                categoryId,
                brandId,
                null,
                null,
                minPrice,
                maxPrice,
                sort,
                page,
                size
        );
    }

    // ---- Chi tiết sản phẩm ----

    public ProductDtos.ProductDetail getProductDetail(Integer productId) {
        Product product = productRepository.findActiveWithDetails(productId)
                .orElseThrow(() -> AppException.notFound("Sản phẩm"));

        return toDetail(product);
    }

    // ---- Categories ----

    public List<ProductDtos.CategoryDto> getCategoryTree() {
        return categoryRepository.findRootCategories()
                .stream()
                .map(this::toCategoryDto)
                .collect(Collectors.toList());
    }

    // =========================================================
    // Mappers
    // =========================================================

    private ProductDtos.ProductSummary toSummary(Product product) {
        ProductVariant minVariant = product.getVariants()
                .stream()
                .filter(v -> v.getStockQuantity() != null && v.getStockQuantity() > 0)
                .min((a, b) -> a.getPrice().compareTo(b.getPrice()))
                .orElse(
                        product.getVariants().isEmpty()
                                ? null
                                : product.getVariants().get(0)
                );

        return ProductDtos.ProductSummary.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .thumbnailUrl(product.getThumbnailUrl())
                .price(minVariant != null ? minVariant.getPrice() : null)
                .originalPrice(minVariant != null ? minVariant.getOriginalPrice() : null)
                .discountPercent(product.getMaxDiscountPercent())
                .soldCount(product.getSoldCount())
                .averageRating(product.getAverageRating())
                .shopName(
                        product.getShop() != null
                                ? product.getShop().getShopName()
                                : null
                )
                .shopId(
                        product.getShop() != null
                                ? product.getShop().getShopId()
                                : null
                )
                .categoryName(
                        product.getCategory() != null
                                ? product.getCategory().getCategoryName()
                                : null
                )
                .build();
    }

    private ProductDtos.ProductDetail toDetail(Product product) {
        List<String> imageUrls = product.getImages()
                .stream()
                .map(ProductImage::getImageUrl)
                .collect(Collectors.toList());

        List<ProductDtos.VariantDto> variants = product.getVariants()
                .stream()
                .map(v -> ProductDtos.VariantDto.builder()
                        .variantId(v.getVariantId())
                        .variantName(v.getVariantName())
                        .sku(v.getSku())
                        .price(flashSaleService.getEffectivePrice(v))
                        .originalPrice(v.getOriginalPrice())
                        .discountPercent(discountPercent(v))
                        .stockQuantity(v.getStockQuantity())
                        .imageUrl(v.getImageUrl())
                        .build())
                .collect(Collectors.toList());

        ProductDtos.ShopInfo shopInfo = null;

        if (product.getShop() != null) {
            Shop shop = product.getShop();

            shopInfo = ProductDtos.ShopInfo.builder()
                    .shopId(shop.getShopId())
                    .shopName(shop.getShopName())
                    .shopSlug(shop.getShopSlug())
                    .avatarUrl(shop.getAvatarUrl())
                    .rating(shop.getRating())
                    .followerCount(shop.getFollowerCount())
                    .build();
        }

        return ProductDtos.ProductDetail.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .description(product.getDescription())
                .thumbnailUrl(product.getThumbnailUrl())
                .images(imageUrls)
                .variants(variants)
                .soldCount(product.getSoldCount())
                .averageRating(product.getAverageRating())
                .shop(shopInfo)
                .categoryName(
                        product.getCategory() != null
                                ? product.getCategory().getCategoryName()
                                : null
                )
                .brandName(
                        product.getBrand() != null
                                ? product.getBrand().getBrandName()
                                : null
                )
                .createdAt(product.getCreatedAt())
                .build();
    }

    private ProductDtos.FlashSaleProduct toFlashSale(FlashSaleItem item) {
        Product product = item.getProduct();

        ProductVariant displayVariant = item.getVariant();

        return ProductDtos.FlashSaleProduct.builder()
                .flashSaleItemId(item.getId())
                .productId(product.getProductId())
                .variantId(displayVariant == null ? null : displayVariant.getVariantId())
                .variantName(displayVariant == null ? null : displayVariant.getVariantName())
                .productName(product.getProductName())
                .thumbnailUrl(product.getThumbnailUrl())
                .salePrice(item.getSalePrice())
                .originalPrice(
                        displayVariant != null
                                ? displayVariant.getOriginalPrice()
                                : null
                )
                .discountPercent(item.getDiscountPercent().intValue())
                .quantityLimit(item.getQuantityLimit())
                .quantitySold(item.getQuantitySold())
                .remainingPercent(item.getRemainingPercent())
                .endTime(item.getEndTime())
                .build();
    }

    private ProductDtos.CategoryDto toCategoryDto(Category category) {
        List<ProductDtos.CategoryDto> children =
                category.getChildren() == null
                        ? List.of()
                        : category.getChildren()
                        .stream()
                        .map(this::toCategoryDto)
                        .collect(Collectors.toList());

        return ProductDtos.CategoryDto.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .children(children)
                .build();
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();

        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeSort(String sort) {
        if (sort == null || sort.trim().isEmpty()) {
            return "newest";
        }

        return switch (sort.trim()) {
            case "price_asc", "price_desc", "bestseller" -> sort.trim();
            default -> "newest";
        };
    }

    private int discountPercent(ProductVariant variant) {
        if (variant == null || variant.getOriginalPrice() == null
                || variant.getOriginalPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            return 0;
        }

        java.math.BigDecimal effectivePrice = flashSaleService.getEffectivePrice(variant);

        return java.math.BigDecimal.ONE
                .subtract(effectivePrice.divide(
                        variant.getOriginalPrice(),
                        4,
                        java.math.RoundingMode.HALF_UP
                ))
                .multiply(java.math.BigDecimal.valueOf(100))
                .setScale(0, java.math.RoundingMode.HALF_UP)
                .intValue();
    }
}
