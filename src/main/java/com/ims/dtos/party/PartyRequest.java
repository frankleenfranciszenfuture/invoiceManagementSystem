package com.ims.dtos.party;


import com.ims.enums.PartyType;
import com.ims.enums.Status;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartyRequest {

//    @NotNull
//    private Long branchId;

    @Size(max = 30)
    private String partyCode;

    @NotNull(message = "Party type is required")
    private PartyType partyType;

    @NotBlank(message = "Company name is required")
    @Size(max = 150)
    private String companyName;

    @Size(max = 100)
    private String contactPerson;

    @NotBlank(message = "Email is required")
    @Pattern(
            regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$",
            message = "Invalid email address"
    )
    private String email;

    @NotBlank(message = "Mobile number is required")
    @Pattern(
            regexp = "^$|^[6-9]\\d{9}$",
            message = "Invalid mobile number"
    )
    private String mobile;

    @Pattern(regexp = "^$|^[6-9]\\d{9}$",
            message = "Invalid alternate mobile")
    private String alternateMobile;

    @Size(max = 20)
    private String gstNumber;

    @Size(max = 20)
    private String panNumber;

    @Size(max = 150)
    private String website;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal creditLimit;

    @Size(max = 200)
    private String paymentTerms;

    private Status status;

    @Valid
//    @NotEmpty(message = "At least one address is required")
    private List<PartyAddressRequest> addresses;

    @Valid
    private List<PartyBankAccountRequest> bankAccounts;
}