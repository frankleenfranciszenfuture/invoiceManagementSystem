package com.ims.dtos.invoiceApproval;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceApprovalDecisionRequest {

    @NotBlank(message = "Decision comment is required")
    @Size(max = 1000, message = "Comment cannot exceed 1000 characters")
    private String comment;
}
