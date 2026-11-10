package com.ims.dtos.saleOrder;

import com.ims.enums.SaleOrderDiscountType;
import com.ims.enums.SaleOrderPartyType;
import com.ims.enums.SaleOrderStatus;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
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

    // =====================================================
    // SHIPPING
    // =====================================================
    @DecimalMin(value = "0.00", message = "ShippingAmount value cannot be negative.")
    @Builder.Default
    private BigDecimal shippingAmount = BigDecimal.ZERO;

    @NotEmpty(message = "At least one sales order item is required")
    @Valid
    private List<SalesOrderItemRequest> items;
}