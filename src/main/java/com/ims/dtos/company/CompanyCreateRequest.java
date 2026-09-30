package com.ims.dtos.company;

import com.ims.enums.CompanyStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class CompanyCreateRequest {

    // =====================================================
    // COMPANY DETAILS
    // =====================================================

    @NotBlank(message = "Company name is required")
    @Size(
            max = 150,
            message = "Company name must not exceed 150 characters"
    )
    private String companyName;

    @Size(
            max = 150,
            message = "Display name must not exceed 150 characters"
    )
    private String displayName;

    @Size(
            max = 200,
            message = "Legal name must not exceed 200 characters"
    )
    private String legalName;

    @NotBlank(message = "Company code is required")
    @Size(
            max = 50,
            message = "Company code must not exceed 50 characters"
    )
    private String companyCode;


    // =====================================================
    // TAX DETAILS
    // =====================================================

    @Size(
            max = 20,
            message = "GST number must not exceed 20 characters"
    )
    private String gstNumber;

    @Size(
            max = 20,
            message = "PAN number must not exceed 20 characters"
    )
    private String panNumber;

    @Size(
            max = 20,
            message = "TAN number must not exceed 20 characters"
    )
    private String tanNumber;


    // =====================================================
    // CONTACT DETAILS
    // =====================================================

    @Email(message = "Invalid email format")
    @Size(
            max = 150,
            message = "Email must not exceed 150 characters"
    )
    private String email;

    @Size(
            max = 20,
            message = "Phone number must not exceed 20 characters"
    )
    private String phone;

    @Size(
            max = 20,
            message = "Alternate phone must not exceed 20 characters"
    )
    private String alternatePhone;

    @Size(
            max = 200,
            message = "Website must not exceed 200 characters"
    )
    private String website;


    // =====================================================
    // ADDRESS
    // =====================================================

    @Size(
            max = 250,
            message = "Address line 1 must not exceed 250 characters"
    )
    private String addressLine1;

    @Size(
            max = 250,
            message = "Address line 2 must not exceed 250 characters"
    )
    private String addressLine2;

    @Size(
            max = 100,
            message = "City must not exceed 100 characters"
    )
    private String city;

    @Size(
            max = 100,
            message = "State must not exceed 100 characters"
    )
    private String state;

    @Size(
            max = 100,
            message = "Country must not exceed 100 characters"
    )
    private String country;

    @Size(
            max = 20,
            message = "Pincode must not exceed 20 characters"
    )
    private String pincode;


    // =====================================================
    // INVOICE SETTINGS
    // =====================================================

    @Size(
            max = 20,
            message = "Invoice prefix must not exceed 20 characters"
    )
    private String invoicePrefix;

    @Min(
            value = 1,
            message = "Invoice start number must be greater than 0"
    )
    private Long invoiceStartNumber;

    @Size(
            max = 10,
            message = "Currency must not exceed 10 characters"
    )
    private String currency;

    @Size(
            max = 20,
            message = "Financial year start must not exceed 20 characters"
    )
    private String financialYearStart;


    // =====================================================
    // STATUS
    // =====================================================

    @NotNull(message = "Company status is required")
    private CompanyStatus status;
}
