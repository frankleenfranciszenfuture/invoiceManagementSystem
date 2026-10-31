package com.ims.entity;


import com.ims.enums.PurchaseOrderTaxType;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(
        name = "purchase_order_items",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_po_product_size_unit",
                        columnNames = {
                                "purchase_order_id",
                                "product_id",
                                "size_id",
                                "unit_id"
                        }
                )
        },
        indexes = {
                @Index(name = "idx_po_item_product", columnList = "product_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PurchaseOrderItemEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // PURCHASE ORDER
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrderEntity purchaseOrder;

    // =====================================================
    // PRODUCT
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @Column(length = 500)
    private String description;

    // =====================================================
    // UNIT AND SIZE
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private UnitEntity unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "size_id")
    private SizeEntity size;

    // =====================================================
    // QUANTITY
    // =====================================================

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal quantity;

    /**
     * Quantity received from the supplier so far.
     */
    @Column(name = "received_quantity", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal receivedQuantity = BigDecimal.ZERO;

    /**
     * Remaining quantity to receive.
     */
    @Transient
    public BigDecimal getPendingQuantity() {
        return quantity == null
                ? BigDecimal.ZERO
                : quantity.subtract(
                receivedQuantity == null
                ? BigDecimal.ZERO
                : receivedQuantity
        ).max(BigDecimal.ZERO);
    }

    // =====================================================
    // PRICE
    // =====================================================

    /**
     * Base unit price in INR.
     */
    @Column(name = "base_unit_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal baseUnitPrice;

    /**
     * Unit price in selected order currency.
     */
    @Column(name = "unit_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal unitPrice;

    // =====================================================
    // LINE AMOUNTS
    // =====================================================

    @Column(name = "line_amount", precision = 19, scale = 2)
    private BigDecimal lineAmount;

    @Column(name = "base_line_amount", precision = 19, scale = 2)
    private BigDecimal baseLineAmount;

    // =====================================================
    // ITEM DISCOUNT
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", length = 20)
    private com.ims.enums.PurchaseOrderDiscountType discountType;

    @Column(name = "discount_value", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal discountValue = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "base_discount_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal baseDiscountAmount = BigDecimal.ZERO;

    // =====================================================
    // TAX MASTER SNAPSHOT
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_master_id")
    private TaxMasterEntity taxMaster;

    @Enumerated(EnumType.STRING)
    @Column(name = "tax_type", length = 20)
    private PurchaseOrderTaxType taxType;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(name = "cgst_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal cgstRate = BigDecimal.ZERO;

    @Column(name = "sgst_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal sgstRate = BigDecimal.ZERO;

    @Column(name = "igst_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal igstRate = BigDecimal.ZERO;

    // =====================================================
    // TAXABLE AMOUNTS
    // =====================================================

    @Column(name = "taxable_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal taxableAmount = BigDecimal.ZERO;

    @Column(name = "base_taxable_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal baseTaxableAmount = BigDecimal.ZERO;

    // =====================================================
    // TAX AMOUNTS
    // =====================================================

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

    @Column(name = "base_total_tax_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal baseTotalTaxAmount = BigDecimal.ZERO;

    // =====================================================
    // TOTAL AMOUNTS
    // =====================================================

    @Column(name = "total_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "base_total_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal baseTotalAmount = BigDecimal.ZERO;
}