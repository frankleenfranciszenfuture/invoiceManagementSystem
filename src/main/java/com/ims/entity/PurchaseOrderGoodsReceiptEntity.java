package com.ims.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "purchase_order_goods_receipts",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_purchase_receipt_no",
                        columnNames = "receipt_no"
                )
        },
        indexes = {
                @Index(name = "idx_receipt_purchase_order", columnList = "purchase_order_id"),
                @Index(name = "idx_receipt_date", columnList = "receipt_date")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PurchaseOrderGoodsReceiptEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_no", nullable = false, length = 50)
    private String receiptNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrderEntity purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private WarehouseEntity warehouse;

    @Column(name = "receipt_date", nullable = false)
    private LocalDate receiptDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(
            mappedBy = "goodsReceipt",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<PurchaseOrderGoodsReceiptItemEntity> items = new ArrayList<>();

    public void addItem(PurchaseOrderGoodsReceiptItemEntity item) {
        if (item == null) {
            return;
        }

        items.add(item);
        item.setGoodsReceipt(this);
    }

    public void removeItem(PurchaseOrderGoodsReceiptItemEntity item) {
        if (item == null) {
            return;
        }

        items.remove(item);
        item.setGoodsReceipt(null);
    }
}