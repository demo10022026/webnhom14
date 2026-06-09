package com.ecommerce.repository;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    Optional<Payment> findByOrder(Order order);

    Optional<Payment> findByTransactionCode(String transactionCode);

    List<Payment> findByOrderIn(Collection<Order> orders);

    @Query("""
        SELECT p
        FROM Payment p
        WHERE p.transactionCode IS NOT NULL
        AND :content LIKE CONCAT('%', p.transactionCode, '%')
        ORDER BY p.paymentId DESC
    """)
    List<Payment> findByTransactionCodeInContent(@Param("content") String content);
}
