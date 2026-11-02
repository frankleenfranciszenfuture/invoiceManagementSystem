package com.ims.entity;

import com.ims.enums.PaymentDirection;
import com.ims.enums.PaymentMethod;
import com.ims.enums.PaymentStatus;
import com.ims.enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(
        name = "payments",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_payment_number",
                        columnNames = "payment_number"
                )
        },
        indexes = {
                @Index(name = "idx_payment_type_source", columnList = "payment_type, source_id"),
                @Index(name = "idx_payment_date", columnList = "payment_date"),
                @Index(name = "idx_payment_status", columnList = "payment_status"),
                @Index(name = "idx_payment_direction", columnList = "payment_direction")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PaymentEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "payment_number",
            nullable = false,
            unique = true,
            length = 50
    )
    private String paymentNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false, length = 30)
    private PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_direction", nullable = false, length = 20)
    private PaymentDirection paymentDirection;

    /*
     * Source document reference.
     *
     * SALES    -> SalesOrderEntity.id
     * PURCHASE -> PurchaseOrderEntity.id
     * EXPENSE  -> ExpenseEntity.id
     */
    @Column(name = "source_id", nullable = false)
    private Long sourceId;

    @Column(name = "source_number", length = 100)
    private String sourceNumber;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(
            name = "payment_amount",
            nullable = false,
            precision = 19,
            scale = 4
    )
    private BigDecimal paymentAmount;

    @Column(
            name = "base_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal baseAmount;

    @Column(
            name = "exchange_rate",
            nullable = false,
            precision = 19,
            scale = 8
    )
    private BigDecimal exchangeRate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "currency_id", nullable = false)
    private Currency currency;

    @Column(name = "currency_code", nullable = false, length = 10)
    private String currencyCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_account_id")
    private BankAccount bankAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cash_account_id")
    private CashAccountEntity cashAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private CustomerEntity customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "party_id")
    private PartyEntity party;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(length = 1000)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.COMPLETED;

    @Column(name = "reversal_reason", length = 500)
    private String reversalReason;
}