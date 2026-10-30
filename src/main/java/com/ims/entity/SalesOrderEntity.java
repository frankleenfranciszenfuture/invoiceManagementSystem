package com.ims.entity;

import com.ims.enums.SaleOrderDiscountType;
import com.ims.enums.SaleOrderPartyType;
import com.ims.enums.SaleOrderStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(
        name = "sales_orders",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_sales_order_no",
                        columnNames = "order_no"
                )
        }
)
public class SalesOrderEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", nullable = false, unique = true)
    private String orderNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "party_type", nullable = false)
    private SaleOrderPartyType partyType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private CustomerEntity customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "party_id")
    private PartyEntity party;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private WarehouseEntity warehouse;

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "sales_order_status")
    private SaleOrderStatus salesOrderStatus;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Currency

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "currency_id", nullable = false)
    private Currency currency;

    @Column(
            name = "exchange_rate",
            precision = 19,
            scale = 8,
            nullable = false
    )
    private BigDecimal exchangeRate = BigDecimal.ONE;

    // Order-level discount configuration

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type")
    private SaleOrderDiscountType discountType;

    @Column(name = "discount_value", precision = 19, scale = 4)
    private BigDecimal discountValue = BigDecimal.ZERO;

    // Financial summary

    @Column(name = "subtotal", precision = 19, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "base_subtotal", precision = 19, scale = 2)
    private BigDecimal baseSubtotal = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 19, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "base_discount_amount", precision = 19, scale = 2)
    private BigDecimal baseDiscountAmount = BigDecimal.ZERO;

    @Column(name = "taxable_amount", precision = 19, scale = 2)
    private BigDecimal taxableAmount = BigDecimal.ZERO;

    @Column(name = "base_taxable_amount", precision = 19, scale = 2)
    private BigDecimal baseTaxableAmount = BigDecimal.ZERO;

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

    @Column(name = "grand_total", precision = 19, scale = 2)
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "base_grand_total", precision = 19, scale = 2)
    private BigDecimal baseGrandTotal = BigDecimal.ZERO;

    // Sales order items

    @OneToMany(
            mappedBy = "salesOrder",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<SalesOrderItemEntity> items = new ArrayList<>();
}