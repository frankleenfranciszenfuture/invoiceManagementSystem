package com.ims.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
        name = "currencies",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_currency_code",
                        columnNames = "code"
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
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 10)
    private String symbol;

    @Column(nullable = false)
    @Builder.Default
    private Integer decimalPlaces = 2;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}