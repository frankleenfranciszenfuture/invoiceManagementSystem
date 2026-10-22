package com.ims.entity;

import com.ims.enums.CompanyStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CompanyDetails extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;
    private String displayName;
    private String legalName;
    private String companyCode;

    private String gstNumber;
    private String panNumber;
    private String tanNumber;

    private String email;
    private String phone;
    private String alternatePhone;
    private String website;

    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String country;
    private String pincode;

    private String logo;
    private String signature;

    private String invoicePrefix;
    private Long invoiceStartNumber;

    private String currency;
    private String financialYearStart;

    @Enumerated(EnumType.STRING)
    private CompanyStatus status;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    private Boolean active = true;
}