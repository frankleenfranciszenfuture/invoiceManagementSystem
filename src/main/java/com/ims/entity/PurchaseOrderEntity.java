package com.ims.entity;

import com.ims.enums.PurchaseOrderDiscountType;
import com.ims.enums.PurchaseOrderStatus;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "purchase_orders",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_purchase_order_no",
                        columnNames = "order_no"
                )
        },
        indexes = {
                @Index(name = "idx_purchase_order_party", columnList = "party_id"),
                @Index(name = "idx_purchase_order_warehouse", columnList = "warehouse_id"),
                @Index(name = "idx_purchase_order_date", columnList = "order_date"),
                @Index(name = "idx_purchase_order_status", columnList = "purchase_order_status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PurchaseOrderEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // PURCHASE ORDER NUMBER
    // =====================================================

    @Column(name = "order_no", nullable = false, length = 50)
    private String orderNo;

    // =====================================================
    // SUPPLIER
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "party_id", nullable = false)
    private PartyEntity party;

    // =====================================================
    // WAREHOUSE
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private WarehouseEntity warehouse;

    // =====================================================
    // DATES
    // =====================================================

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    // =====================================================
    // STATUS
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "purchase_order_status", nullable = false, length = 30)
    @Builder.Default
    private PurchaseOrderStatus purchaseOrderStatus =
            PurchaseOrderStatus.DRAFT;

    // =====================================================
    // NOTES
    // =====================================================

    @Column(length = 1000)
    private String notes;

    // =====================================================
    // CURRENCY
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "currency_id", nullable = false)
    private Currency currency;

    /**
     * INR value of one unit of the selected currency.
     * Example: USD -> INR = 83.50
     */
    @Column(
            name = "exchange_rate",
            precision = 19,
            scale = 8,
            nullable = false
    )
    @Builder.Default
    private BigDecimal exchangeRate = BigDecimal.ONE;

    // =====================================================
    // ORDER DISCOUNT
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", length = 20)
    private PurchaseOrderDiscountType discountType;

    @Column(name = "discount_value", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal discountValue = BigDecimal.ZERO;

    // =====================================================
    // SELECTED CURRENCY TOTALS
    // =====================================================

    @Column(precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "taxable_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal taxableAmount = BigDecimal.ZERO;

    @Column(name = "cgst_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal cgstAmount = BigDecimal.ZERO;

    @Column(name = "sgst_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal sgstAmount = BigDecimal.ZERO;

    @Column(name = "igst_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal igstAmount = BigDecimal.ZERO;

    @Column(name = "total_tax_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal totalTaxAmount = BigDecimal.ZERO;

    @Column(name = "grand_total", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal grandTotal = BigDecimal.ZERO;

    // =====================================================
    // BASE CURRENCY TOTALS (INR)
    // =====================================================

    @Column(name = "base_subtotal", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal baseSubtotal = BigDecimal.ZERO;

    @Column(name = "base_discount_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal baseDiscountAmount = BigDecimal.ZERO;

    @Column(name = "base_taxable_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal baseTaxableAmount = BigDecimal.ZERO;

    @Column(name = "base_total_tax_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal baseTotalTaxAmount = BigDecimal.ZERO;

    @Column(name = "base_grand_total", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal baseGrandTotal = BigDecimal.ZERO;

    // =====================================================
    // RECEIVED TOTALS
    // Amount recognized from goods actually received.
    // =====================================================

    @Column(name = "received_total_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal receivedTotalAmount = BigDecimal.ZERO;

    @Column(name = "base_received_total_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal baseReceivedTotalAmount = BigDecimal.ZERO;

    // =====================================================
    // ITEMS
    // =====================================================

    @OneToMany(
            mappedBy = "purchaseOrder",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<PurchaseOrderItemEntity> items = new ArrayList<>();

    public void addItem(PurchaseOrderItemEntity item) {
        items.add(item);
        item.setPurchaseOrder(this);
    }

    public void removeItem(PurchaseOrderItemEntity item) {
        items.remove(item);
        item.setPurchaseOrder(null);
    }

    @OneToMany(
            mappedBy = "purchaseOrder",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<PurchaseOrderGoodsReceiptEntity> goodsReceipts = new ArrayList<>();

    public void addGoodsReceipt(PurchaseOrderGoodsReceiptEntity receipt) {
        if (receipt == null) {
            return;
        }

        goodsReceipts.add(receipt);
        receipt.setPurchaseOrder(this);
    }

    public void removeGoodsReceipt(PurchaseOrderGoodsReceiptEntity receipt) {
        if (receipt == null) {
            return;
        }

        goodsReceipts.remove(receipt);
        receipt.setPurchaseOrder(null);
    }
}