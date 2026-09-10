package com.ims.entity;


import com.ims.enums.PartyType;
import com.ims.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(
        name = "parties"
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PartyEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =====================================================
    // PARTY CODE
    // =====================================================

    @Column(
            name = "party_code",
            nullable = false,
            length = 30
    )
    private String partyCode;


    // =====================================================
    // PARTY TYPE
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "party_type",
            nullable = false,
            length = 30
    )
    private PartyType partyType;


    // =====================================================
    // COMPANY NAME
    // =====================================================

    @Column(
            name = "company_name",
            nullable = false,
            length = 150
    )
    private String companyName;


    // =====================================================
    // CONTACT PERSON
    // =====================================================

    @Column(
            name = "contact_person",
            length = 100
    )
    private String contactPerson;


    // =====================================================
    // EMAIL
    // =====================================================

    @Column(length = 100)
    private String email;


    // =====================================================
    // MOBILE
    // =====================================================

    @Column(
            nullable = false,
            length = 15
    )
    private String mobile;


    // =====================================================
    // ALTERNATE MOBILE
    // =====================================================

    @Column(
            name = "alternate_mobile",
            length = 15
    )
    private String alternateMobile;


    // =====================================================
    // GST NUMBER
    // =====================================================

    @Column(
            name = "gst_number",
            length = 20
    )
    private String gstNumber;


    // =====================================================
    // PAN NUMBER
    // =====================================================

    @Column(
            name = "pan_number",
            length = 20
    )
    private String panNumber;


    // =====================================================
    // BANK ACCOUNTS
    // =====================================================

    @OneToMany(
            mappedBy = "party",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<PartyBankAccountEntity> bankAccounts =
            new ArrayList<>();


    // =====================================================
    // WEBSITE
    // =====================================================

    @Column(length = 150)
    private String website;


    // =====================================================
    // CREDIT LIMIT
    // =====================================================

    @Column(
            name = "credit_limit",
            precision = 15,
            scale = 2
    )
    private BigDecimal creditLimit;


    // =====================================================
    // PAYMENT TERMS
    // =====================================================

    @Column(
            name = "payment_terms",
            length = 200
    )
    private String paymentTerms;


    // =====================================================
    // STATUS
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;


    // =====================================================
    // ADDRESSES
    // =====================================================

    @OneToMany(
            mappedBy = "party",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<PartyAddressEntity> addresses =
            new ArrayList<>();


    // =====================================================
    // PRE PERSIST
    // =====================================================

    @PrePersist
    public void prePersist() {

        if (status == null) {
            status = Status.ACTIVE;
        }
    }


    // =====================================================
    // ADDRESS HELPERS
    // =====================================================

    public void addAddress(PartyAddressEntity address) {

        addresses.add(address);
        address.setParty(this);
    }


    public void removeAddress(PartyAddressEntity address) {

        addresses.remove(address);
        address.setParty(null);
    }
}