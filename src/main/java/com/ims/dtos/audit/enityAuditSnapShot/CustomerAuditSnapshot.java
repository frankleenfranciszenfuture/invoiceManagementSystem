package com.ims.dtos.audit.enityAuditSnapShot;



import com.ims.enums.CustomerStatus;
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
public class CustomerAuditSnapshot {

    private Long id;

    private String customerType;

    private String salutation;

    private String firstName;

    private String lastName;

    private String companyName;

    private String displayName;

    private String currency;

    private String email;

    private String workPhoneCode;

    private String workPhone;

    private String mobileCode;

    private String mobile;

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

    private CustomerStatus status;

    private CustomerAddressAuditSnapshot billingAddress;

    private CustomerAddressAuditSnapshot shippingAddress;

    private Boolean active;
}