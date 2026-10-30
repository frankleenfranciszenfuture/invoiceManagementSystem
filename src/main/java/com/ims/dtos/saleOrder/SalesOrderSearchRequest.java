
package com.ims.dtos.saleOrder;

import com.ims.enums.SaleOrderPartyType;
import com.ims.enums.SaleOrderStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesOrderSearchRequest {

    private String search;

    private String orderNo;

    private SaleOrderPartyType partyType;

    private Long customerId;

    private Long partyId;

    private Long warehouseId;

    private Long currencyId;

    private SaleOrderStatus salesOrderStatus;

    private LocalDate fromDate;

    private LocalDate toDate;
}
