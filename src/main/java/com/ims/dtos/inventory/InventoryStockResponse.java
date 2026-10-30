package com.ims.dtos.inventory;

import com.ims.dtos.common.BaseResponse;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class InventoryStockResponse extends BaseResponse {

    private Long id;

    private Long productId;
    private String productName;
    private String productCode;

    private Long warehouseId;
    private String warehouseName;

    private Long unitId;
    private String unitName;
    private String unitShortName;

    private Long sizeId;
    private String sizeName;

    private BigDecimal quantity;
    private BigDecimal reservedQuantity;
    private BigDecimal availableQuantity;

    private BigDecimal averageCost;

    public void calculateAvailableQuantity() {
        this.availableQuantity = quantity
                .subtract(reservedQuantity);
    }
}