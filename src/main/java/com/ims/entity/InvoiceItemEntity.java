package com.ims.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(
        name = "invoice_items",
        indexes = {

                @Index(
                        name = "idx_invoice_item_invoice",
                        columnList = "invoice_id"
                ),


                @Index(
                        name = "idx_invoice_item_item_master",
                        columnList = "item_master_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class InvoiceItemEntity extends BaseEntity {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =====================================================
    // INVOICE
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "invoice_id",
            nullable = false
    )
    private InvoiceEntity invoice;

    // =====================================================
    // PRODUCT
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "product_id",
            nullable = false
    )
    private ProductEntity product;

    // =====================================================
    // DESCRIPTION
    // =====================================================

    @Column(
            name = "description",
            length = 500
    )
    private String description;


    // =====================================================
    // UNIT
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private UnitEntity unit;


    // =====================================================
    // SIZE
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "size_id")
    private SizeEntity size;


    // =====================================================
    // QUANTITY
    // =====================================================

    @Column(
            nullable = false,
            precision = 19,
            scale = 3
    )
    private BigDecimal quantity;


    // =====================================================
    // UNIT PRICE
    // =====================================================

    @Column(
            name = "unit_price",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal unitPrice;


    // =====================================================
    // AMOUNTS
    // =====================================================

    @Column(
            name = "gross_amount",
            precision = 19,
            scale = 2
    )
    private BigDecimal grossAmount;


    @Column(
            name = "discount_amount",
            precision = 19,
            scale = 2
    )
    private BigDecimal discountAmount;


    @Column(
            name = "taxable_amount",
            precision = 19,
            scale = 2
    )
    private BigDecimal taxableAmount;


    // =====================================================
    // TAX MASTER
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_master_id")
    private TaxMasterEntity taxMaster;


    // =====================================================
    // TAX RATE SNAPSHOT
    // =====================================================

    @Column(
            precision = 5,
            scale = 2
    )
    private BigDecimal taxPercentage;


    @Column(
            precision = 5,
            scale = 2
    )
    private BigDecimal cgstPercentage;


    @Column(
            precision = 5,
            scale = 2
    )
    private BigDecimal sgstPercentage;


    @Column(
            precision = 5,
            scale = 2
    )
    private BigDecimal igstPercentage;


    // =====================================================
    // TAX AMOUNT
    // =====================================================

    @Column(
            precision = 19,
            scale = 2
    )
    private BigDecimal cgstAmount;


    @Column(
            precision = 19,
            scale = 2
    )
    private BigDecimal sgstAmount;


    @Column(
            precision = 19,
            scale = 2
    )
    private BigDecimal igstAmount;


    @Column(
            precision = 19,
            scale = 2
    )
    private BigDecimal taxAmount;


    // =====================================================
    // TOTAL
    // =====================================================

    @Column(
            name = "total_amount",
            precision = 19,
            scale = 2
    )
    private BigDecimal totalAmount;
}

