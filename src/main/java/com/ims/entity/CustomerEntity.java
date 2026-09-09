package com.ims.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ims.entity.AddressEntity;
import com.ims.enums.CustomerStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customers")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class CustomerEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String customerType;

    private String salutation;

    private String firstName;

    private String lastName;

    private String companyName;

    @Column(nullable = false)
    private String displayName;

    private String currency;

    @Column(unique = true)
    private String email;

    private String workPhoneCode;

    private String workPhone;

    private String mobileCode;

    private String mobile;

    @Column(name = "customer_language")
    private String customerLanguage;

    private String pan;

    private String paymentTerms;

    private Boolean enablePortal;

    private String websiteUrl;

    private String department;

    private String designation;

    private String twitter;

    private String skype;

    private String facebook;

    @Enumerated(EnumType.STRING)
    private CustomerStatus status;


    // =====================================================
    // INVOICES
    // =====================================================

    @OneToMany(
            mappedBy = "party",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY
    )
    @JsonManagedReference
    @Builder.Default
    private List<InvoiceEntity> invoices =
            new ArrayList<>();


    // =====================================================
    // BILLING ADDRESS
    // =====================================================

    @OneToOne(
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JoinColumn(name = "billing_address_id")
    private AddressEntity billingAddress;


    // =====================================================
    // SHIPPING ADDRESS
    // =====================================================

    @OneToOne(
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JoinColumn(name = "shipping_address_id")
    private AddressEntity shippingAddress;

}