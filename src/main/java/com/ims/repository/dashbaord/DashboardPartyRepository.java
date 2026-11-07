package com.ims.repository.dashbaord;

import com.ims.entity.PartyEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface DashboardPartyRepository
        extends JpaRepository<PartyEntity, Long> {

    @Query("""
        SELECT COALESCE(SUM(p.outstandingReceivable), 0)
        FROM PartyEntity p
        WHERE p.active = true
    """)
    BigDecimal getTotalOutstandingReceivables();

    @Query("""
        SELECT COALESCE(SUM(p.outstandingPayable), 0)
        FROM PartyEntity p
        WHERE p.active = true
    """)
    BigDecimal getTotalOutstandingPayables();

    @Query("""
        SELECT COUNT(p)
        FROM PartyEntity p
        WHERE p.active = true
    """)
    Long countActiveParties();
}

