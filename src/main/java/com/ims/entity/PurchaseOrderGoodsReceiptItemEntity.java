package com.ims.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(
        name = "purchase_order_goods_receipt_items",
        indexes = {
                @Index(name = "idx_receipt_item_receipt", columnList = "goods_receipt_id"),
                @Index(name = "idx_receipt_item_order_item", columnList = "purchase_order_item_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PurchaseOrderGoodsReceiptItemEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goods_receipt_id", nullable = false)
    private PurchaseOrderGoodsReceiptEntity goodsReceipt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_item_id", nullable = false)
    private PurchaseOrderItemEntity purchaseOrderItem;

    @Column(
            name = "received_quantity",
            nullable = false,
            precision = 19,
            scale = 4
    )
    private BigDecimal receivedQuantity;

    /**
     * Actual received unit cost in INR.
     */
    @Column(
            name = "received_unit_cost",
            nullable = false,
            precision = 19,
            scale = 4
    )
    private BigDecimal receivedUnitCost;

    @Column(
            name = "received_total_cost",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal receivedTotalCost;
}