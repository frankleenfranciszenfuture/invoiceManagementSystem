package com.ims.dtos.sizes;


import com.ims.enums.Status;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SizeRequest {

    @NotBlank(message = "Size name is required")
    private String sizeName;

    @NotBlank(message = "Size short name is required")
    private String sizeShortName;

    private Status status;

    private String description;
}
