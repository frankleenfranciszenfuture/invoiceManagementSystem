package com.ims.entity;

import com.ims.enums.SaleOrderDiscountType;
import com.ims.enums.SaleOrderTaxType;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(
        name = "sales_order_items",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_so_product_size_unit",
                        columnNames = {
                                "sales_order_id",
                                "product_id",
                                "size_id",
                                "unit_id"
                        }
                )
        }
)
@Getter
@Setter
public class SalesOrderItemEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Sales order

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sales_order_id", nullable = false)
    private SalesOrderEntity salesOrder;

    // Product

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @Column(name = "description", length = 500)
    private String description;

    // Unit and size

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unit_id", nullable = false)
    private UnitEntity unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "size_id")
    private SizeEntity size;

    // Quantity and price

    @Column(nullable = false, precision = 19, scale = 3)
    private BigDecimal quantity;

    // Base currency price (INR)

    @Column(name = "base_unit_price", precision = 19, scale = 4)
    private BigDecimal baseUnitPrice = BigDecimal.ZERO;

    // Selected currency price

    @Column(name = "unit_price", precision = 19, scale = 4)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    // Line amounts

    @Column(name = "line_amount", precision = 19, scale = 2)
    private BigDecimal lineAmount = BigDecimal.ZERO;

    @Column(name = "base_line_amount", precision = 19, scale = 2)
    private BigDecimal baseLineAmount = BigDecimal.ZERO;

    // Item discount

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type")
    private SaleOrderDiscountType discountType;

    @Column(name = "discount_value", precision = 19, scale = 4)
    private BigDecimal discountValue = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 19, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "base_discount_amount", precision = 19, scale = 2)
    private BigDecimal baseDiscountAmount = BigDecimal.ZERO;

    // Tax master

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_master_id")
    private TaxMasterEntity taxMaster;

    // Tax snapshot

    @Enumerated(EnumType.STRING)
    @Column(name = "tax_type")
    private SaleOrderTaxType taxType;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(name = "cgst_rate", precision = 5, scale = 2)
    private BigDecimal cgstRate = BigDecimal.ZERO;

    @Column(name = "sgst_rate", precision = 5, scale = 2)
    private BigDecimal sgstRate = BigDecimal.ZERO;

    @Column(name = "igst_rate", precision = 5, scale = 2)
    private BigDecimal igstRate = BigDecimal.ZERO;

    // Taxable amounts

    @Column(name = "taxable_amount", precision = 19, scale = 2)
    private BigDecimal taxableAmount = BigDecimal.ZERO;

    @Column(name = "base_taxable_amount", precision = 19, scale = 2)
    private BigDecimal baseTaxableAmount = BigDecimal.ZERO;

    // Tax amounts

    @Column(name = "cgst_amount", precision = 19, scale = 2)
    private BigDecimal cgstAmount = BigDecimal.ZERO;

    @Column(name = "sgst_amount", precision = 19, scale = 2)
    private BigDecimal sgstAmount = BigDecimal.ZERO;

    @Column(name = "igst_amount", precision = 19, scale = 2)
    private BigDecimal igstAmount = BigDecimal.ZERO;

    @Column(name = "total_tax_amount", precision = 19, scale = 2)
    private BigDecimal totalTaxAmount = BigDecimal.ZERO;

    @Column(name = "base_total_tax_amount", precision = 19, scale = 2)
    private BigDecimal baseTotalTaxAmount = BigDecimal.ZERO;

    // Final amounts

    @Column(name = "total_amount", precision = 19, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "base_total_amount", precision = 19, scale = 2)
    private BigDecimal baseTotalAmount = BigDecimal.ZERO;
}