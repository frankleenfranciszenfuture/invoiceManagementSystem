package com.ims.dtos.purchaseOrder;



import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderGoodsReceiptRequest {

    @NotNull(message = "Purchase Order ID is required.")
    private Long purchaseOrderId;

    @NotNull(message = "Receipt date is required.")
    private LocalDate receiptDate;

    private String notes;

    @NotEmpty(message = "At least one received item is required.")
    @Valid
    private List<PurchaseOrderGoodsReceiptItemRequest> items;
}
