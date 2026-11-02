package com.ims.entity;

import com.ims.enums.BankTransactionDirection;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(
        name = "cash_book_transactions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_cash_transaction_number",
                        columnNames = "transaction_number"
                ),
                @UniqueConstraint(
                        name = "uk_cash_transaction_payment",
                        columnNames = "payment_id"
                )
        },
        indexes = {
                @Index(name = "idx_cash_transaction_date", columnList = "transaction_date"),
                @Index(name = "idx_cash_transaction_account", columnList = "cash_account_id"),
                @Index(name = "idx_cash_transaction_direction", columnList = "direction")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CashBookTransactionEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "transaction_number",
            nullable = false,
            unique = true,
            length = 50
    )
    private String transactionNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cash_account_id", nullable = false)
    private CashAccountEntity cashAccount;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "payment_id",
            unique = true
    )
    private PaymentEntity payment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BankTransactionDirection direction;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(
            nullable = false,
            precision = 19,
            scale = 4
    )
    private BigDecimal amount;

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

    @Column(name = "currency_code", nullable = false, length = 10)
    private String currencyCode;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reversal_of_id")
    private CashBookTransactionEntity reversalOf;
}