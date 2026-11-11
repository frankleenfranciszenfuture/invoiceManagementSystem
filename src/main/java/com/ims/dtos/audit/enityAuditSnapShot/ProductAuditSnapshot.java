package com.ims.dtos.audit.enityAuditSnapShot;



import com.ims.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductAuditSnapshot {

    private Long id;

    private String productCode;

    private String sku;

    private String productName;

    private Long subCategoryId;

    private String subCategoryName;

    private Long categoryId;

    private String categoryName;

    private String brand;

    private String hsnCode;

    private String imageUrl;

    private BigDecimal sellingPrice;

    private BigDecimal purchasingPrice;

    private Long partyId;

    private String partyName;

    private Long taxId;

    private String taxName;

    private BigDecimal minimumStock;

    private BigDecimal maximumStock;

    private Status status;

    private Boolean active;
}
