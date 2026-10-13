package com.ims.dtos.salesPerson;

import com.ims.enums.SalesPersonType;
import com.ims.enums.Status;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;


@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class SalesPersonRequest {


    @Size(max = 30)
    private String salesPersonCode;

    @NotNull(message = "SalesPerson type is required")
    private SalesPersonType salesPersonType;

    @Size(max = 100)
    private String salesPersonName;

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


    private Status status;

}