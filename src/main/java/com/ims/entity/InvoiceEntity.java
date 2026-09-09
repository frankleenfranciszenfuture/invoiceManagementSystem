package com.ims.entity;

import com.ims.enums.InvoiceStatus;
import com.ims.enums.InvoiceType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "invoices",
        indexes = {

                @Index(
                        name = "idx_invoice_number",
                        columnList = "invoice_number"
                ),

                @Index(
                        name = "idx_invoice_date",
                        columnList = "invoice_date"
                ),

                @Index(
                        name = "idx_invoice_type",
                        columnList = "invoice_type"
                ),

                @Index(
                        name = "idx_invoice_status",
                        columnList = "status"
                ),

                @Index(
                        name = "idx_invoice_party",
                        columnList = "party_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class InvoiceEntity extends BaseEntity {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =====================================================
    // INVOICE NUMBER
    // =====================================================

    @Column(
            name = "invoice_number",
            nullable = false,
            unique = true,
            length = 50
    )
    private String invoiceNumber;


    // =====================================================
    // INVOICE TYPE
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "invoice_type",
            nullable = false,
            length = 30
    )
    private InvoiceType invoiceType;


    // =====================================================
    // PARTY
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "party_id",
            nullable = false
    )
    private CustomerEntity party;


    // =====================================================
    // DATES
    // =====================================================

    @Column(
            name = "invoice_date",
            nullable = false
    )
    private LocalDate invoiceDate;


    @Column(name = "due_date")
    private LocalDate dueDate;


    // =====================================================
    // AMOUNTS
    // =====================================================

    @Column(
            name = "subtotal",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;


    @Column(
            name = "discount_amount",
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;


    @Column(
            name = "tax_amount",
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;


    @Column(
            name = "shipping_amount",
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal shippingAmount = BigDecimal.ZERO;


    @Column(
            name = "grand_total",
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal grandTotal = BigDecimal.ZERO;


    // =====================================================
    // STATUS
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 30
    )
    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.DRAFT;


    // =====================================================
    // NOTES
    // =====================================================

    @Column(
            name = "notes",
            length = 1000
    )
    private String notes;


    // =====================================================
    // TERMS & CONDITIONS
    // =====================================================

    @Column(
            name = "terms_and_conditions",
            length = 2000
    )
    private String termsAndConditions;


    // =====================================================
    // ITEMS
    // =====================================================

    @OneToMany(
            mappedBy = "invoice",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<InvoiceItemEntity> invoiceItems =
            new ArrayList<>();
}