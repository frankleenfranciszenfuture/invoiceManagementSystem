package com.ims.dtos.invoice;

import com.ims.dtos.common.BaseResponse;
import com.ims.dtos.customer.CustomerResponse;
import com.ims.dtos.party.PartyResponse;
import com.ims.dtos.salesPerson.SalesPersonResponse;
import com.ims.dtos.company.CompanyResponse;
import com.ims.dtos.bankAccount.BankAccountResponse;
import com.ims.dtos.emailSignature.EmailSignatureResponse;

import com.ims.enums.InvoicePartyType;
import com.ims.enums.InvoiceSourceType;
import com.ims.enums.InvoiceStatus;
import com.ims.enums.InvoiceType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class InvoiceResponse extends BaseResponse {

    // =========================================================
    // BASIC DETAILS
    // =========================================================

    private Long id;

    private String invoiceNumber;

    private InvoiceType invoiceType;

    // =========================================================
    // PARTY DETAILS
    // =========================================================

    private InvoicePartyType partyType;

    private Long customerId;

    private String customerName;

    private CustomerResponse customer;

    private Long partyId;

    private String partyName;

    private PartyResponse party;

    // =========================================================
    // SOURCE ORDER DETAILS
    // =========================================================

    private InvoiceSourceType sourceType;

    private Long purchaseOrderId;

    private String purchaseOrderNumber;

    private Long salesOrderId;

    private String salesOrderNumber;

    // =========================================================
    // DATE DETAILS
    // =========================================================

    private LocalDate invoiceDate;

    private LocalDate dueDate;

    // =========================================================
    // AMOUNT DETAILS
    // =========================================================

    private BigDecimal subtotal;

    private BigDecimal discountAmount;

    private BigDecimal taxAmount;

    private BigDecimal shippingAmount;

    private BigDecimal grandTotal;

    // =========================================================
    // SALES PERSON
    // =========================================================

    private Long salesPersonId;

    private String salesPersonName;

    private SalesPersonResponse salesPerson;

    // =========================================================
    // COMPANY DETAILS
    // =========================================================

    private Long companyId;

    private String companyName;

    private CompanyResponse company;

    // =========================================================
    // BANK ACCOUNT DETAILS
    // =========================================================

    private Long bankAccountId;

    private String bankAccountName;

    private BankAccountResponse bankAccount;

    // =========================================================
    // EMAIL SIGNATURE DETAILS
    // =========================================================

    private Long emailSignatureId;

    private String emailSignatureName;

    private EmailSignatureResponse emailSignature;

    // =========================================================
    // CURRENCY DETAILS
    // =========================================================

    private Long currencyId;

    private String currencyName;

    private String currencyCode;

    private String currencySymbol;

    private Integer decimalPlaces;

    private BigDecimal exchangeRate;

    // =========================================================
    // INVOICE STATUS
    // =========================================================

    private InvoiceStatus status;

    private LocalDateTime invoiceSentAt;

    // =========================================================
    // ADDITIONAL DETAILS
    // =========================================================

    private String notes;

    private String termsAndConditions;

    private String logo;

    // =========================================================
    // INVOICE ITEMS
    // =========================================================

    private List<InvoiceItemResponse> invoiceItems;
}