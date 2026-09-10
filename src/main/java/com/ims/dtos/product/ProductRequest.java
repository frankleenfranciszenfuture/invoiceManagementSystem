package com.ims.dtos.product;


import com.ims.enums.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ProductRequest {


    @NotBlank(message = "Product name is required")
    private String productName;


    @NotNull(message = "Sub category is required")
    private Long subCategoryId;


    private Long partyId;


    private String brand;


    private String hsnCode;


    private String imageUrl;


    @NotNull(message = "Selling price is required")
    private BigDecimal sellingPrice;

    @NotNull(message = "Selling price is required")
    private BigDecimal purchasingPrice;

    private Long taxId;


    private BigDecimal minimumStock;


    private BigDecimal maximumStock;


    private List<Long> sizeIds;


    private List<Long> unitIds;


    private Status status;

}