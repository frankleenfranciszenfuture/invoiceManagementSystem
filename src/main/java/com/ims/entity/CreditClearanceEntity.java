package com.ims.entity;




import com.ims.enums.PartyType;
import com.ims.enums.PaymentMethod;
import com.ims.enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
        name = "credit_clearances",
        indexes = {
                @Index(
                        name = "idx_credit_clearance_party",
                        columnList = "party_id"
                ),
                @Index(
                        name = "idx_credit_clearance_date",
                        columnList = "clearance_date"
                ),
                @Index(
                        name = "idx_credit_clearance_status",
                        columnList = "status"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CreditClearanceEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // CLEARANCE NUMBER
    // =====================================================

    @Column(
            name = "clearance_no",
            nullable = false,
            unique = true,
            length = 50
    )
    private String clearanceNo;

    // =====================================================
    // PARTY
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "party_id",
            nullable = false
    )
    private PartyEntity party;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "party_type",
            nullable = false,
            length = 30
    )
    private PartyType partyType;

    // =====================================================
    // CREDIT DETAILS
    // =====================================================

    @Column(
            name = "credit_limit",
            precision = 15,
            scale = 2
    )
    private BigDecimal creditLimit;

    @Column(
            name = "clearance_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal clearanceAmount;

    @Column(
            name = "previous_outstanding_credit",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal previousOutstandingCredit;

    @Column(
            name = "remaining_outstanding_credit",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal remainingOutstandingCredit;

    // =====================================================
    // PAYMENT
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "payment_method",
            nullable = false,
            length = 30
    )
    private PaymentMethod paymentMethod;

    @Column(
            name = "payment_reference_number",
            length = 100
    )
    private String paymentReferenceNumber;

    // =====================================================
    // DATE
    // =====================================================

    @Column(
            name = "clearance_date",
            nullable = false
    )
    private LocalDate clearanceDate;

    // =====================================================
    // REMARKS
    // =====================================================

    @Column(
            name = "remarks",
            length = 500
    )
    private String remarks;

    // =====================================================
    // STATUS
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 30
    )
    private Status status;
}

