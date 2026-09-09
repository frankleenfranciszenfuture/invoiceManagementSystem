package com.ims.dtos.customer;


import com.ims.dtos.address.Address;
import com.ims.dtos.common.BaseResponse;
import com.ims.enums.CustomerStatus;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse extends BaseResponse {

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

    private Address billingAddress;

    private Address shippingAddress;

    private CustomerStatus status;
}

