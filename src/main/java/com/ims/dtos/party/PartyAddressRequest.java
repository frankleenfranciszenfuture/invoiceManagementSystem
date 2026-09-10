package com.ims.dtos.party;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartyAddressRequest {

    @NotBlank(message = "Address Line 1 is required")
    @Size(max = 200)
    private String addressLine1;

    @Size(max = 200)
    private String addressLine2;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String district;

    @Size(max = 100)
    private String state;

    @Size(max = 100)
    private String country;

    @Size(max = 15)
    private String postalCode;

    @Builder.Default
    private Boolean defaultAddress = false;
}

