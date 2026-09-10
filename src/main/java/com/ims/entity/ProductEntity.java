package com.ims.entity;


import com.ims.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;


@Entity
@Table(
        name = "products",
        uniqueConstraints = {

                @UniqueConstraint(
                        name = "uk_product_code",
                        columnNames = "product_code"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(
        onlyExplicitlyIncluded = true,
        callSuper = false
)
@ToString(
        exclude = {
                "sizes",
                "units"
        }
)
public class ProductEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;


    @Column(
            name = "product_code",
            length = 30
    )
    private String productCode;


    @Column(
            name = "sku",
            length = 50
    )
    private String sku;


    @Column(
            name = "product_name",
            nullable = false,
            length = 100
    )
    private String productName;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "sub_category_id",
            nullable = false
    )
    private SubCategoryEntity subCategory;

    @OneToMany(
            mappedBy = "product",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private Set<SizeEntity> sizes =
            new HashSet<>();


    @OneToMany(
            mappedBy = "product",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private Set<UnitEntity> units =
            new HashSet<>();


    @Column(length = 100)
    private String brand;


    @Column(length = 20)
    private String hsnCode;


    @Column(length = 255)
    private String imageUrl;


    @Column(
            precision = 12,
            scale = 2,
            nullable = false
    )
    private BigDecimal sellingPrice;


    @Column(
            precision = 12,
            scale = 2,
            nullable = false
    )
    private BigDecimal purchasingPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "party_id"
    )
    private PartyEntity party;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "tax_id",
            nullable = false
    )
    private TaxMasterEntity tax;


    @Column(
            precision = 12,
            scale = 3
    )
    private BigDecimal minimumStock;


    @Column(
            precision = 12,
            scale = 3
    )
    private BigDecimal maximumStock;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
}
