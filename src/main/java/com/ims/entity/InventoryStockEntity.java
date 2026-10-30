package com.ims.entity;


import com.ims.entity.BaseEntity;
import com.ims.entity.ProductEntity;
import com.ims.entity.WarehouseEntity;
import com.ims.entity.UnitEntity;
import com.ims.entity.SizeEntity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(
        name = "inventory_stocks",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_inventory_product_warehouse_unit_size",
                        columnNames = {
                                "product_id",
                                "warehouse_id",
                                "unit_id",
                                "size_id"
                        }
                )
        },
        indexes = {
                @Index(name = "idx_inventory_product", columnList = "product_id"),
                @Index(name = "idx_inventory_warehouse", columnList = "warehouse_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class InventoryStockEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private WarehouseEntity warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private UnitEntity unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "size_id")
    private SizeEntity size;

    @Column(
            name = "quantity",
            precision = 19,
            scale = 4,
            nullable = false
    )
    @Builder.Default
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(
            name = "reserved_quantity",
            precision = 19,
            scale = 4,
            nullable = false
    )
    @Builder.Default
    private BigDecimal reservedQuantity = BigDecimal.ZERO;

    @Column(
            name = "available_quantity",
            precision = 19,
            scale = 4,
            nullable = false
    )
    @Builder.Default
    private BigDecimal availableQuantity = BigDecimal.ZERO;

    @Column(
            name = "average_cost",
            precision = 19,
            scale = 4,
            nullable = false
    )
    @Builder.Default
    private BigDecimal averageCost = BigDecimal.ZERO;
}