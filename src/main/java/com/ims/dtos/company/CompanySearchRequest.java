package com.ims.dtos.company;

import com.ims.enums.CompanyStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
public class CompanySearchRequest {

    private String search;

    private String companyName;

    private String companyCode;

    private String gstNumber;

    private String panNumber;

    private String phone;

    private String email;

    private String city;

    private String state;

    private CompanyStatus status;

    private Boolean active;
}

