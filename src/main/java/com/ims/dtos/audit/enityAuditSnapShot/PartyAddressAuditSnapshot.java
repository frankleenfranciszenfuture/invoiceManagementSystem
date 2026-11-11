package com.ims.dtos.audit.enityAuditSnapShot;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartyAddressAuditSnapshot {

    private Long id;

    private String addressLine1;

    private String addressLine2;

    private String city;

    private String district;

    private String state;

    private String country;

    private String postalCode;

    private Boolean defaultAddress;

    private Boolean active;
}