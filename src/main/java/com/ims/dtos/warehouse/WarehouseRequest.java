package com.ims.dtos.warehouse;

import com.ims.enums.Status;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WarehouseRequest {


    @NotBlank
    private String warehouseName;

    private String contactPerson;

    private String phone;

    private String email;

    private String address;

    private String city;

    private String state;

    private String pincode;

    private Status status;
}
