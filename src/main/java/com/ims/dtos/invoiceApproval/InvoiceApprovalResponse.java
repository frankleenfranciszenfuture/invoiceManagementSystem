package com.ims.dtos.invoiceApproval;


import com.ims.dtos.common.BaseResponse;
import com.ims.enums.InvoiceApprovalStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceApprovalResponse extends BaseResponse {

    private Long id;

    private Long invoiceId;
    private String invoiceNumber;

    private String invoiceType;
    private BigDecimal grandTotal;

    private InvoiceApprovalStatus status;

    private Long submittedById;
    private String submittedByName;

    private Long decidedById;
    private String decidedByName;

    private String submissionComment;
    private String decisionComment;

    private LocalDateTime submittedAt;
    private LocalDateTime decidedAt;
}
