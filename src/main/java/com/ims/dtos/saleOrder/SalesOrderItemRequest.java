package com.ims.dtos.saleOrder;

import com.ims.enums.SaleOrderDiscountType;
import com.ims.enums.SaleOrderPartyType;
import com.ims.enums.SaleOrderStatus;

import com.ims.enums.SaleOrderTaxType;
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
public class SalesOrderItemRequest {

    @NotNull(message = "Product is required")
    private Long productId;

    private String description;

    private Long unitId;

    private Long sizeId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.001")
    private BigDecimal quantity;

    @NotNull(message = "Base unit price is required")
    @DecimalMin(value = "0.00")
    private BigDecimal baseUnitPrice;

    private SaleOrderDiscountType discountType;

    private BigDecimal discountValue = BigDecimal.ZERO;

    private Long taxMasterId;

}