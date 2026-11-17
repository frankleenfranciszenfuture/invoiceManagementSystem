
package com.ims.dtos.invoice;

import com.ims.enums.InvoicePartyType;
import com.ims.enums.InvoiceStatus;
import com.ims.enums.InvoiceType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceCreateRequest {

    private String invoiceNumber;

    @NotNull(message = "Invoice type is required")
    private InvoiceType invoiceType;

    // CUSTOMER or PARTY
    @NotNull(message = "Invoice party type is required")
    private InvoicePartyType partyType;

    // Only one of these two IDs should be supplied.
    private Long customerId;

    private Long partyId;

    private Long purchaseOrderId;

    private Long salesOrderId;

    @NotNull(message = "Invoice date is required")
    private LocalDate invoiceDate;

    private LocalDate dueDate;

    @Builder.Default
    private BigDecimal shippingAmount = BigDecimal.ZERO;

    private Long salesPersonId;

    @NotNull(message = "Currency is required")
    private Long currencyId;

    private BigDecimal exchangeRate;

    private Long companyId;

    private Long bankAccountId;

    private Long emailSignatureId;

    private String notes;

    private String termsAndConditions;

    private InvoiceStatus invoiceStatus;

    @NotEmpty(message = "Invoice must contain at least one item")
    @Valid
    @Builder.Default
    private List<InvoiceItemRequest> invoiceItems = new ArrayList<>();
}
