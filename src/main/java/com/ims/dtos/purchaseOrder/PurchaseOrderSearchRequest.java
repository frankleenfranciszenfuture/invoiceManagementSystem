package com.ims.dtos.purchaseOrder;


import com.ims.enums.PurchaseOrderStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderSearchRequest {

    private String search;

    private String orderNo;

    private Long partyId;

    private Long warehouseId;

    private Long currencyId;

    private PurchaseOrderStatus purchaseOrderStatus;

    private LocalDate fromDate;

    private LocalDate toDate;
}
