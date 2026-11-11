package com.ims.dtos.audit.enityAuditSnapShot;


import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class InventoryStockAuditSnapshot {

    private Long id;

    // Product
    private Long productId;
    private String productName;
    private String productCode;

    // Warehouse
    private Long warehouseId;
    private String warehouseName;

    // Unit
    private Long unitId;
    private String unitName;
    private String unitShortName;

    // Size
    private Long sizeId;
    private String sizeName;

    // Stock quantities
    private BigDecimal quantity;
    private BigDecimal reservedQuantity;
    private BigDecimal availableQuantity;

    // Cost
    private BigDecimal averageCost;

    // Audit
    private Boolean active;
}

