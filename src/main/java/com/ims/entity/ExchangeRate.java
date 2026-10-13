package com.ims.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
        name = "exchange_rates",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_exchange_rate_pair_date",
                        columnNames = {
                                "from_currency_id",
                                "to_currency_id",
                                "effective_date"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_exchange_rate_effective_date",
                        columnList = "effective_date"
                )
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExchangeRate extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "from_currency_id", nullable = false)
    private Currency fromCurrency;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "to_currency_id", nullable = false)
    private Currency toCurrency;

    @Column(nullable = false, precision = 18, scale = 6)
    private BigDecimal rate;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}