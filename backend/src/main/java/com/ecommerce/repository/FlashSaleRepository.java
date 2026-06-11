package com.ecommerce.repository;

import com.ecommerce.entity.FlashSaleItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlashSaleRepository extends JpaRepository<FlashSaleItem, Integer> {

    @Modifying
    @Query("""
        DELETE FROM FlashSaleItem f
        WHERE f.product.productId = :productId
    """)
    void deleteByProductId(@Param("productId") Integer productId);

    @Query("""
        SELECT f FROM FlashSaleItem f
        JOIN FETCH f.product p
        JOIN FETCH f.variant v
        WHERE f.isActive = true
        AND f.startTime <= :now AND f.endTime >= :now
        AND COALESCE(f.quantitySold, 0) < COALESCE(f.quantityLimit, 0)
        AND p.productStatus = 'active'
        AND v.stockQuantity > 0
        ORDER BY f.discountPercent DESC
        """)
    List<FlashSaleItem> findActiveFlashSales(LocalDateTime now, Pageable pageable);

    @Query("SELECT f.endTime FROM FlashSaleItem f WHERE f.isActive = true AND f.startTime <= :now AND f.endTime >= :now ORDER BY f.endTime ASC")
    List<java.time.LocalDateTime> findNextEndTime(LocalDateTime now, Pageable pageable);

    @Query("""
        SELECT COUNT(f)
        FROM FlashSaleItem f
        WHERE f.isActive = true
        AND f.startTime <= :now AND f.endTime >= :now
        AND COALESCE(f.quantitySold, 0) < COALESCE(f.quantityLimit, 0)
    """)
    long countAvailableActiveFlashSales(@Param("now") LocalDateTime now);

    @Query("""
        SELECT f
        FROM FlashSaleItem f
        JOIN FETCH f.product p
        JOIN FETCH f.variant v
        WHERE f.isActive = true
        AND f.startTime <= :now AND f.endTime >= :now
        AND COALESCE(f.quantitySold, 0) < COALESCE(f.quantityLimit, 0)
        AND v.variantId = :variantId
        AND p.productStatus = 'active'
        AND v.stockQuantity > 0
        ORDER BY f.discountPercent DESC
    """)
    List<FlashSaleItem> findActiveByVariant(
            @Param("variantId") Integer variantId,
            @Param("now") LocalDateTime now,
            Pageable pageable
    );

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
        UPDATE FlashSaleItem f
        SET f.quantitySold = COALESCE(f.quantitySold, 0) + :quantity
        WHERE f.id = :flashSaleItemId
        AND f.isActive = true
        AND f.startTime <= :now AND f.endTime >= :now
        AND COALESCE(f.quantitySold, 0) + :quantity <= COALESCE(f.quantityLimit, 0)
    """)
    int increaseSoldIfAvailable(
            @Param("flashSaleItemId") Integer flashSaleItemId,
            @Param("quantity") int quantity,
            @Param("now") LocalDateTime now
    );

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
        UPDATE FlashSaleItem f
        SET f.isActive = false
        WHERE f.isActive = true
        AND f.endTime < :now
    """)
    int deactivateExpired(@Param("now") LocalDateTime now);

    Optional<FlashSaleItem> findFirstByVariantVariantIdAndStartTimeAndEndTime(
            Integer variantId,
            LocalDateTime startTime,
            LocalDateTime endTime
    );
}
