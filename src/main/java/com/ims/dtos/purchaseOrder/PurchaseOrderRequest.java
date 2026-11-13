package com.ims.dtos.purchaseOrder;

import com.ims.enums.PurchaseOrderDiscountType;
import com.ims.enums.PurchaseOrderPartyType;
import com.ims.enums.SaleOrderPartyType;
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
public class PurchaseOrderRequest {

    @NotNull(message = "Party type is required")
    private PurchaseOrderPartyType partyType;

    private Long customerId;

    private Long partyId;

    @NotNull(message = "Warehouse is required.")
    private Long warehouseId;

    @NotNull(message = "Order date is required.")
    private LocalDate orderDate;

    private LocalDate expectedDeliveryDate;

    private String notes;

    @NotNull(message = "Currency is required.")
    private Long currencyId;

    private PurchaseOrderDiscountType discountType;

    @DecimalMin(value = "0.00", message = "Discount value cannot be negative.")
    @Builder.Default
    private BigDecimal discountValue = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "ShippingAmount value cannot be negative.")
    @Builder.Default
    private BigDecimal shippingAmount = BigDecimal.ZERO;

    @NotEmpty(message = "At least one purchase order item is required.")
    @Valid
    private List<PurchaseOrderItemRequest> items;
}