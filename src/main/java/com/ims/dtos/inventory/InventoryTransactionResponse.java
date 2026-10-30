package com.ims.dtos.inventory;

import com.ims.dtos.common.BaseResponse;
import com.ims.enums.InventoryMovementType;
import com.ims.enums.InventoryReferenceType;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class InventoryTransactionResponse extends BaseResponse {

    private Long id;

    private String transactionNo;

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

    private InventoryMovementType movementType;
    private InventoryReferenceType referenceType;

    private Long referenceId;

    private BigDecimal quantityIn;
    private BigDecimal quantityOut;
    private BigDecimal balanceAfter;

    private BigDecimal unitCost;

    private LocalDateTime transactionDate;

    private String notes;
}