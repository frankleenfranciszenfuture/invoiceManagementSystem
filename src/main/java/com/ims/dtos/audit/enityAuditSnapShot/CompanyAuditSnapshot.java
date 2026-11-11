package com.ims.dtos.audit.enityAuditSnapShot;


import com.ims.enums.CompanyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyAuditSnapshot {

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

    private CompanyStatus status;

    private Boolean isDefault;

    private Boolean active;
}
