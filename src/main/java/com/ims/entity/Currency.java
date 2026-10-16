package com.ims.entity;


import com.ims.enums.CurrencyStatus;
import com.ims.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
        name = "currencies",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_currency_code",
                        columnNames = "currencyCode"
                )
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Currency extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 3, unique = true)
    private String currencyCode;

    @Column(nullable = false, length = 100)
    private String currencyName;

    @Column(nullable = false, length = 10)
    private String symbol;

    @Column(nullable = false)
    @Builder.Default
    private Integer decimalPlaces = 2;

    //=====================================================
    // STATUS
    //=====================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CurrencyStatus status;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}