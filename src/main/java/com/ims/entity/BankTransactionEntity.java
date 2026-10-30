
package com.ims.entity;

import com.ims.enums.BankTransactionDirection;
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
        name = "bank_transactions",
        indexes = {
                @Index(
                        name = "idx_bank_transaction_number",
                        columnList = "transaction_number"
                ),
                @Index(
                        name = "idx_bank_transaction_date",
                        columnList = "transaction_date"
                ),
                @Index(
                        name = "idx_bank_transaction_account",
                        columnList = "bank_account_id"
                ),
                @Index(
                        name = "idx_bank_transaction_direction",
                        columnList = "direction"
                ),
                @Index(
                        name = "idx_bank_transaction_reversal",
                        columnList = "reversal_of_id"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_bank_transaction_number",
                        columnNames = "transaction_number"
                ),
                @UniqueConstraint(
                        name = "uk_bank_transaction_payment",
                        columnNames = "payment_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class BankTransactionEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "transaction_number",
            nullable = false,
            length = 50
    )
    private String transactionNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_account_id", nullable = false)
    private BankAccount bankAccount;

    /**
     * Original payment linked to this bank transaction.
     * Reversal transactions do not reference the payment directly.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private PaymentEntity payment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "party_id")
    private PartyEntity party;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BankTransactionDirection direction;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "base_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal baseAmount;

    // INR value of one unit of bank account currency.
    @Column(name = "exchange_rate", nullable = false, precision = 19, scale = 8)
    private BigDecimal exchangeRate;

    @Column(name = "currency_code", nullable = false, length = 10)
    private String currencyCode;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Original transaction ID when this is a reversal.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reversal_of_id")
    private BankTransactionEntity reversalOf;
}
