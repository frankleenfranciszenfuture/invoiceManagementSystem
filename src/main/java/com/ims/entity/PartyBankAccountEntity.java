package com.ims.entity;

import com.ims.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;


@Entity
@Table(
        name = "party_bank_accounts",
        indexes = {

                @Index(
                        name = "idx_bank_party",
                        columnList = "party_id"
                ),

                @Index(
                        name = "idx_bank_account_number",
                        columnList = "account_number"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PartyBankAccountEntity extends BaseEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    //=====================================================
    // PARTY
    //=====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "party_id",
            nullable = false
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private PartyEntity party;


    //=====================================================
    // BANK DETAILS
    //=====================================================


    @Column(
            nullable = false,
            length = 100
    )
    private String bankName;


    @Column(
            nullable = false,
            length = 100
    )
    private String accountHolderName;


    @Column(
            nullable = false,
            length = 30
    )
    private String accountNumber;


    @Column(
            nullable = false,
            length = 20
    )
    private String ifscCode;


    @Column(length = 100)
    private String branchName;


    @Column(length = 50)
    private String accountType;
    /*
        SAVINGS
        CURRENT
        OD
        CC
    */


    @Column(
            nullable = false
    )
    @Builder.Default
    private Boolean primaryAccount = false;


    @Column(length = 200)
    private String remarks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ACTIVE;
}
