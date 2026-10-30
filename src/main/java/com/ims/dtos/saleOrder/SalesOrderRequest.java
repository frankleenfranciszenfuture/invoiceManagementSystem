package com.ims.dtos.saleOrder;

import com.ims.enums.SaleOrderDiscountType;
import com.ims.enums.SaleOrderPartyType;
import com.ims.enums.SaleOrderStatus;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesOrderRequest {

    private String orderNo;

    @NotNull(message = "Party type is required")
    private SaleOrderPartyType partyType;

    private Long customerId;

    private Long partyId;

    @NotNull(message = "Warehouse is required")
    private Long warehouseId;

    @NotNull(message = "Order date is required")
    private LocalDate orderDate;

    private LocalDate expectedDeliveryDate;

    private SaleOrderStatus salesOrderStatus;

    private String notes;

    @NotNull(message = "Currency is required")
    private Long currencyId;

    private SaleOrderDiscountType discountType;

    private BigDecimal discountValue = BigDecimal.ZERO;

    @NotEmpty(message = "At least one sales order item is required")
    @Valid
    private List<SalesOrderItemRequest> items;
}