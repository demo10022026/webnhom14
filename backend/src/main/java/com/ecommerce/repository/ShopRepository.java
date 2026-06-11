package com.ecommerce.repository;

import com.ecommerce.entity.SellerProfile;
import com.ecommerce.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ShopRepository extends JpaRepository<Shop, Integer> {

    @Query("""
    select distinct s
    from Shop s
    left join fetch s.seller sp
    left join fetch sp.user
    where s.shopId in :shopIds
""")
    List<Shop> findAllByShopIdInWithSellerUser(@Param("shopIds") Collection<Integer> shopIds);

    Optional<Shop> findBySeller(SellerProfile seller);

    List<Shop> findBySellerIn(Collection<SellerProfile> sellers);

    boolean existsBySeller(SellerProfile seller);

    boolean existsByShopSlug(String shopSlug);

    Optional<Shop> findByShopSlug(String shopSlug);

    long countByShopStatus(Shop.Status status);
}
