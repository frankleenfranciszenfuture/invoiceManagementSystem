package com.ims.dtos.inventory;

import com.ims.enums.InventoryMovementType;
import com.ims.enums.InventoryReferenceType;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryDashboardFilter {

    private LocalDateTime fromDate;
    private LocalDateTime toDate;

    private Long warehouseId;
    private Long productId;
    private Long unitId;
    private Long sizeId;

    private InventoryMovementType movementType;
    private InventoryReferenceType referenceType;

    private Integer page;
    private Integer size;

    private String sortBy;
    private String sortDirection;
}
