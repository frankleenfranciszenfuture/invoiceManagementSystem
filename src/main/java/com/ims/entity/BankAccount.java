package com.ims.entity;

import com.ims.enums.BankAccountStatus;
import com.ims.enums.BankAccountType;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(
        name = "bank_accounts",
        indexes = {
                @Index(
                        name = "idx_bank_account_code",
                        columnList = "account_code"
                ),
                @Index(
                        name = "idx_bank_account_number",
                        columnList = "account_number"
                ),
                @Index(
                        name = "idx_bank_account_name",
                        columnList = "account_name"
                ),
                @Index(
                        name = "idx_bank_account_type",
                        columnList = "account_type"
                ),
                @Index(
                        name = "idx_bank_account_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_bank_account_active",
                        columnList = "active"
                )
        }
)
public class BankAccount extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "account_type",
            nullable = false,
            length = 30
    )
    private BankAccountType accountType;

    @Column(
            name = "account_name",
            nullable = false,
            length = 150
    )
    private String accountName;

    @Column(
            name = "account_code",
            nullable = false,
            length = 50
    )
    private String accountCode;

    @Column(
            name = "currency",
            length = 10
    )
    private String currency;

    @Column(
            name = "account_number",
            nullable = false,
            length = 100
    )
    private String accountNumber;

    @Column(
            name = "bank_name",
            length = 150
    )
    private String bankName;

    @Column(
            name = "ifsc",
            length = 20
    )
    private String ifsc;

    @ElementCollection
    @CollectionTable(
            name = "bank_account_users",
            joinColumns = @JoinColumn(
                    name = "bank_account_id"
            )
    )
    @Column(name = "user_id")
    private List<Long> userIds = new ArrayList<>();

    @Column(
            name = "description",
            columnDefinition = "TEXT"
    )
    private String description;

    @Column(
            name = "primary_account",
            nullable = false
    )
    private Boolean primaryAccount = false;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 20
    )
    private BankAccountStatus status;

    @Column(
            name = "active",
            nullable = false
    )
    private Boolean active = true;
}