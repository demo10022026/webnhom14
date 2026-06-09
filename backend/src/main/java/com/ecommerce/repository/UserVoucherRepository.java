package com.ecommerce.repository;

import com.ecommerce.entity.User;
import com.ecommerce.entity.UserVoucher;
import com.ecommerce.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserVoucherRepository extends JpaRepository<UserVoucher, Integer> {

    List<UserVoucher> findByUser(User user);

    List<UserVoucher> findByUserOrderBySavedAtDesc(User user);

    Optional<UserVoucher> findByUserAndVoucher(
            User user,
            Voucher voucher
    );

    @Modifying(flushAutomatically = true)
    @Query("""
        UPDATE UserVoucher uv
        SET uv.usedCount = COALESCE(uv.usedCount, 0) + 1
        WHERE uv.user = :user
        AND uv.voucher = :voucher
        AND (
            :perUserLimit IS NULL
            OR :perUserLimit <= 0
            OR COALESCE(uv.usedCount, 0) < :perUserLimit
        )
    """)
    int increaseUsageIfAvailable(
            @Param("user") User user,
            @Param("voucher") Voucher voucher,
            @Param("perUserLimit") Integer perUserLimit
    );

    boolean existsByUserAndVoucher(
            User user,
            Voucher voucher
    );

    long countByVoucher(Voucher voucher);

    long countByVoucherAndUsedCountGreaterThan(
            Voucher voucher,
            Integer usedCount
    );
}
