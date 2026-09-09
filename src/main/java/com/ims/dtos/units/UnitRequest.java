package com.ims.dtos.units;


import com.ims.enums.Status;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UnitRequest {


    @NotBlank(message = "Unit name is required.")
    private String unitName;

    @NotBlank(message = "Size short name is required")
    private String unitShortName;

    private Status status;

}
