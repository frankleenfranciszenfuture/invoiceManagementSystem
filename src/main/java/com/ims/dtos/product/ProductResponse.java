package com.ims.dtos.product;

import com.ims.dtos.common.BaseResponse;
import com.ims.dtos.sizes.SizeResponse;
import com.ims.dtos.units.UnitResponse;
import com.ims.enums.Status;
import lombok.Data;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.List;

@Data
@SuperBuilder
public class ProductResponse extends BaseResponse {

    private Long id;

//    private Long branchId;
//    private String branchName;

    private String productCode;
    private String sku;

    private String productName;

    private Long subCategoryId;
    private String subCategoryName;

    // Retrieved from SubCategory -> Category
    private Long categoryId;
    private String categoryName;

    private List<SizeResponse> sizes;


    private List<UnitResponse> units;

    private String brand;
    private String hsnCode;
//    private String unit;

    private String imageUrl;

    private BigDecimal sellingPrice;

    private BigDecimal purchasingPrice;

    private Long taxId;

    private String taxName;

    private BigDecimal taxRate;

    private Integer minimumStock;
    private Integer maximumStock;

    private Status status;
}
