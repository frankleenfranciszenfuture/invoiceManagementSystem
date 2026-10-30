package com.ims.entity;



import com.ims.enums.InventoryMovementType;
import com.ims.enums.InventoryReferenceType;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "inventory_transactions",
        indexes = {
                @Index(name = "idx_inventory_transaction_product", columnList = "product_id"),
                @Index(name = "idx_inventory_transaction_warehouse", columnList = "warehouse_id"),
                @Index(name = "idx_inventory_transaction_date", columnList = "transaction_date"),
                @Index(name = "idx_inventory_transaction_reference",
                        columnList = "reference_type, reference_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class InventoryTransactionEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "transaction_no",
            nullable = false,
            unique = true,
            length = 50
    )
    private String transactionNo;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false, length = 40)
    private InventoryMovementType movementType;

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", nullable = false, length = 40)
    private InventoryReferenceType referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "quantity_in", precision = 19, scale = 4, nullable = false)
    private BigDecimal quantityIn;

    @Column(name = "quantity_out", precision = 19, scale = 4, nullable = false)
    private BigDecimal quantityOut;

    @Column(name = "balance_after", precision = 19, scale = 4, nullable = false)
    private BigDecimal balanceAfter;

    @Column(name = "unit_cost", precision = 19, scale = 4, nullable = false)
    private BigDecimal unitCost;

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    @Column(name = "notes", length = 1000)
    private String notes;
}