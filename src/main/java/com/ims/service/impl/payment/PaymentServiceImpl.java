package com.ims.service.impl.payment;

import com.ims.common.PageResponse;
import com.ims.dtos.payment.PaymentAllocationRequestDTO;
import com.ims.dtos.payment.PaymentRequestDTO;
import com.ims.dtos.payment.PaymentResponseDTO;
import com.ims.entity.*;
import com.ims.enums.*;

import com.ims.mapper.payment.PaymentMapper;
import com.ims.repository.*;
import com.ims.service.serviceInterface.currency.ExchangeRateService;
import com.ims.service.serviceInterface.payment.PaymentService;

import com.ims.utils.specification.PaymentSpecification;
import com.ims.utils.validation.PaymentValidation;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BankTransactionRepository bankTransactionRepository;
    private final CashBookTransactionRepository cashBookTransactionRepository;

    private final BankAccountRepository bankAccountRepository;
    private final CashAccountRepository cashAccountRepository;
    private final CurrencyRepository currencyRepository;

    private final SaleOrderRepository saleOrderRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ExpenseRepository expenseRepository;
    private final InvoiceRepository invoiceRepository;

    private final ExchangeRateService exchangeRateService;
    private final PaymentValidation paymentValidation;
    private final PaymentMapper paymentMapper;

    private final EntityManager entityManager;

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final int AMOUNT_SCALE = 2;
    private static final int RATE_SCALE = 8;

    // =========================================================
    // CREATE PAYMENT
    // =========================================================

    @Override
    public PaymentResponseDTO createPayment(PaymentRequestDTO request) {

        validateRequest(request);

        boolean splitMode =
                request.getAllocations() != null
                        && !request.getAllocations().isEmpty();

        List<PaymentAllocationRequestDTO> allocations;

        if (splitMode) {
            allocations = request.getAllocations();
        } else {
            allocations = List.of(
                    PaymentAllocationRequestDTO.builder()
                            .paymentAmount(request.getPaymentAmount())
                            .paymentMethod(request.getPaymentMethod())
                            .bankAccountId(request.getBankAccountId())
                            .cashAccountId(request.getCashAccountId())
                            .build()
            );
        }

        SourceDetails source = getAndLockSource(
                request.getPaymentType(),
                request.getSourceId()
        );

        if (source.totalAmount() == null
                || source.totalAmount().compareTo(ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Source document has an invalid total amount"
            );
        }

        BigDecimal alreadyPaid = getCompletedPaymentAmount(
                request.getPaymentType(),
                request.getSourceId()
        );

        BigDecimal remainingDue = source.totalAmount()
                .subtract(alreadyPaid)
                .max(ZERO);

        if (remainingDue.compareTo(ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "This source document is already fully paid."
            );
        }

        Currency sourceCurrency = source.currency();

        if (sourceCurrency == null
                || !Boolean.TRUE.equals(sourceCurrency.getActive())) {
            throw new IllegalArgumentException(
                    "Source document currency is missing or inactive"
            );
        }

        BigDecimal exchangeRate = getExchangeRate(
                sourceCurrency,
                request.getPaymentDate()
        );

        BigDecimal totalAllocated = ZERO;
        BigDecimal totalBaseAmount = ZERO;

        List<PaymentResponseDTO> createdPayments = new ArrayList<>();

        for (PaymentAllocationRequestDTO allocation : allocations) {

            validateAllocation(
                    request.getPaymentType(),
                    allocation
            );

            BigDecimal allocationAmount = allocation.getPaymentAmount();

            if (allocationAmount.compareTo(remainingDue) > 0) {
                throw new IllegalArgumentException(
                        "Payment allocation of "
                                + allocationAmount
                                + " exceeds the remaining due amount: "
                                + remainingDue
                );
            }

            PaymentEntity payment = createPaymentAllocation(
                    request,
                    source,
                    sourceCurrency,
                    exchangeRate,
                    allocation
            );

            createdPayments.add(
                    paymentMapper.toResponse(payment)
            );

            remainingDue = remainingDue.subtract(allocationAmount);
            totalAllocated = totalAllocated.add(allocationAmount);
            totalBaseAmount = totalBaseAmount.add(
                    payment.getBaseAmount()
            );
        }

        if (!splitMode) {
            return createdPayments.get(0);
        }

        PaymentResponseDTO summary = paymentMapper.toResponse(
                paymentRepository.findById(
                        createdPayments.get(0).getId()
                ).orElseThrow()
        );

        summary.setId(null);
        summary.setPaymentNumber(null);
        summary.setPaymentAmount(totalAllocated);
        summary.setBaseAmount(totalBaseAmount);
        summary.setPaymentMethod(null);
        summary.setBankAccountId(null);
        summary.setBankAccountName(null);
        summary.setCashAccountId(null);
        summary.setCashAccountName(null);

        summary.setAllocations(createdPayments);
        summary.setTotalAllocatedAmount(totalAllocated);
        summary.setAllocationCount(createdPayments.size());

        return summary;
    }

    // =========================================================
    // GET PAYMENT BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentById(Long id) {

        PaymentEntity payment = paymentRepository
                .findByIdAndActiveTrue(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Payment not found with ID: " + id
                ));

        return paymentMapper.toResponse(payment);
    }

    // =========================================================
    // GET ALL PAYMENTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaymentResponseDTO> getAllPayments(
            int page,
            int size,
            String sortBy,
            String sortDirection,
            PaymentType paymentType,
            PaymentDirection paymentDirection,
            PaymentMethod paymentMethod,
            PaymentStatus paymentStatus,
            Long sourceId,
            LocalDate fromDate,
            LocalDate toDate,
            String search
    ) {

        if (page < 0 || size <= 0) {
            throw new IllegalArgumentException(
                    "Invalid pagination values"
            );
        }

        if (fromDate != null && toDate != null
                && fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException(
                    "From date cannot be after to date"
            );
        }

        String safeSortBy = switch (sortBy == null ? "" : sortBy) {
            case "paymentNumber",
                 "paymentDate",
                 "paymentAmount",
                 "paymentType",
                 "paymentStatus",
                 "createdAt" -> sortBy;
            default -> "paymentDate";
        };

        Sort.Direction direction =
                "asc".equalsIgnoreCase(sortDirection)
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(direction, safeSortBy)
        );

        Specification<PaymentEntity> specification =
                PaymentSpecification.filter(
                        paymentType,
                        paymentDirection,
                        paymentMethod,
                        paymentStatus,
                        sourceId,
                        fromDate,
                        toDate,
                        search
                );

        Page<PaymentResponseDTO> result = paymentRepository
                .findAll(specification, pageable)
                .map(paymentMapper::toResponse);

        return PageResponse.<PaymentResponseDTO>builder()
                .content(result.getContent())
                .pageNumber(result.getNumber())
                .pageSize(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    // =========================================================
    // GET PAYMENTS BY SOURCE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponseDTO> getPaymentsBySource(
            PaymentType paymentType,
            Long sourceId
    ) {

        if (paymentType == null || sourceId == null) {
            throw new IllegalArgumentException(
                    "Payment type and source ID are required"
            );
        }

        return paymentRepository
                .findAllByPaymentTypeAndSourceIdAndActiveTrue(
                        paymentType,
                        sourceId
                )
                .stream()
                .map(paymentMapper::toResponse)
                .toList();
    }

    // =========================================================
    // SOURCE DOCUMENT LOCKING AND DETAILS
    // =========================================================

    private SourceDetails getAndLockSource(
            PaymentType paymentType,
            Long sourceId
    ) {

        return switch (paymentType) {

            case SALES -> {
                SalesOrderEntity order = saleOrderRepository
                        .findActiveByIdForUpdate(sourceId)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Sales order not found or inactive"
                        ));

                yield new SourceDetails(
                        order.getGrandTotal(),
                        order.getCurrency(),
                        order.getOrderNo(),
                        order.getCustomer(),
                        order.getParty(),
                        null,
                        null
                );
            }

            case PURCHASE -> {
                PurchaseOrderEntity order = purchaseOrderRepository
                        .findActiveByIdForUpdate(sourceId)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Purchase order not found or inactive"
                        ));

                yield new SourceDetails(
                        order.getGrandTotal(),
                        order.getCurrency(),
                        order.getOrderNo(),
                        null,
                        order.getParty(),
                        null,
                        null
                );
            }

            case EXPENSE -> {
                ExpenseEntity expense = expenseRepository
                        .findByIdAndActiveTrue(sourceId)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Expense not found or inactive"
                        ));

                entityManager.lock(
                        expense,
                        LockModeType.PESSIMISTIC_WRITE
                );

                yield new SourceDetails(
                        expense.getTotalAmount(),
                        expense.getCurrency(),
                        expense.getExpenseNo(),
                        null,
                        expense.getVendor(),
                        expense,
                        null
                );
            }

            case INVOICE -> {

                InvoiceEntity invoice = invoiceRepository
                        .findByIdAndActiveTrue(sourceId)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Invoice not found or inactive"
                        ));

                entityManager.lock(
                        invoice,
                        LockModeType.PESSIMISTIC_WRITE
                );

                if (invoice.getStatus() != InvoiceStatus.APPROVED
                        && invoice.getStatus() != InvoiceStatus.SENT
                        && invoice.getStatus() != InvoiceStatus.PARTIAL
                        && invoice.getStatus() != InvoiceStatus.OVERDUE) {

                    throw new IllegalStateException(
                            "Payment is allowed only for approved or sent invoices. "
                                    + "Current status: " + invoice.getStatus()
                    );
                }

                yield new SourceDetails(
                        invoice.getGrandTotal(),
                        invoice.getCurrency(),
                        invoice.getInvoiceNumber(),
                        invoice.getCustomer(),
                        null,
                        null,
                        invoice
                );
            }
        };
    }

    private record SourceDetails(
            BigDecimal totalAmount,
            Currency currency,
            String sourceNumber,
            CustomerEntity customer,
            PartyEntity party,
            ExpenseEntity expense,
            InvoiceEntity invoice
    ) {
    }

    // =========================================================
    // COMPLETED PAYMENT TOTAL
    // =========================================================

    private BigDecimal getCompletedPaymentAmount(
            PaymentType paymentType,
            Long sourceId
    ) {

        BigDecimal amount =
                paymentRepository.calculateCompletedPaymentAmount(
                        paymentType,
                        sourceId,
                        PaymentStatus.COMPLETED
                );

        return amount == null ? ZERO : amount;
    }

    // =========================================================
    // INVOICE PAYMENT STATUS
    // =========================================================

    // =========================================================
// INVOICE PAYMENT STATUS
// =========================================================

    private void updateInvoicePaymentStatus(
            InvoiceEntity invoice,
            BigDecimal paidAmount
    ) {

        if (invoice == null) {
            throw new IllegalStateException(
                    "Invoice not found while updating payment status"
            );
        }

        if (invoice.getStatus() == InvoiceStatus.DRAFT
                || invoice.getStatus() == InvoiceStatus.CANCELLED
                || invoice.getStatus() == InvoiceStatus.REJECTED
                || invoice.getStatus() == InvoiceStatus.PENDING_APPROVAL) {

            return;
        }

        BigDecimal invoiceTotal = safeAmount(
                invoice.getGrandTotal()
        );

        BigDecimal paid = safeAmount(paidAmount)
                .max(ZERO)
                .min(invoiceTotal);

        if (invoiceTotal.compareTo(ZERO) <= 0) {
            throw new IllegalStateException(
                    "Invoice total must be greater than zero."
            );
        }

        if (paid.compareTo(invoiceTotal) >= 0) {

            invoice.setStatus(InvoiceStatus.PAID);

        } else if (paid.compareTo(ZERO) > 0) {

            invoice.setStatus(InvoiceStatus.PARTIAL);

        } else if (invoice.getDueDate() != null
                && invoice.getDueDate().isBefore(LocalDate.now())
                && (invoice.getStatus() == InvoiceStatus.SENT
                || invoice.getStatus() == InvoiceStatus.OVERDUE)) {

            invoice.setStatus(InvoiceStatus.OVERDUE);

        } else if (invoice.getStatus() == InvoiceStatus.PARTIAL
                || invoice.getStatus() == InvoiceStatus.PAID
                || invoice.getStatus() == InvoiceStatus.OVERDUE) {

            // Payment reversal: do not mark an unpaid invoice as SENT
            // unless it was previously sent.
            invoice.setStatus(InvoiceStatus.SENT);

        }
    }

    // =========================================================
    // EXCHANGE RATE
    // =========================================================

    private BigDecimal getExchangeRate(
            Currency sourceCurrency,
            LocalDate paymentDate
    ) {

        Currency inrCurrency = currencyRepository
                .findByCurrencyCodeIgnoreCase("INR")
                .orElseThrow(() -> new IllegalStateException(
                        "INR currency is not configured"
                ));

        if (!Boolean.TRUE.equals(inrCurrency.getActive())) {
            throw new IllegalStateException(
                    "INR currency is inactive"
            );
        }

        if (sourceCurrency.getId().equals(inrCurrency.getId())) {
            return BigDecimal.ONE.setScale(
                    RATE_SCALE,
                    RoundingMode.HALF_UP
            );
        }

        var response = exchangeRateService.getRate(
                sourceCurrency.getId(),
                inrCurrency.getId(),
                paymentDate
        );

        if (response == null
                || !response.isSuccess()
                || response.getData() == null
                || response.getData().getRate() == null
                || response.getData().getRate().compareTo(ZERO) <= 0) {
            throw new IllegalStateException(
                    "Unable to obtain exchange rate for payment currency"
            );
        }

        return response.getData().getRate().setScale(
                RATE_SCALE,
                RoundingMode.HALF_UP
        );
    }

    // =========================================================
    // BANK / CASH LEDGER ENTRY
    // =========================================================

    private void createLedgerTransaction(PaymentEntity payment) {

        BankTransactionDirection direction =
                payment.getPaymentDirection() == PaymentDirection.RECEIVED
                        ? BankTransactionDirection.CREDIT
                        : BankTransactionDirection.DEBIT;

        if (payment.getPaymentMethod() == PaymentMethod.CASH) {

            CashBookTransactionEntity transaction =
                    CashBookTransactionEntity.builder()
                            .transactionNumber(
                                    generateTransactionNumber("CBT")
                            )
                            .cashAccount(payment.getCashAccount())
                            .payment(payment)
                            .direction(direction)
                            .transactionDate(payment.getPaymentDate())
                            .amount(payment.getPaymentAmount())
                            .baseAmount(payment.getBaseAmount())
                            .exchangeRate(payment.getExchangeRate())
                            .currencyCode(payment.getCurrencyCode())
                            .referenceNumber(payment.getReferenceNumber())
                            .description(
                                    payment.getPaymentType()
                                            + " payment "
                                            + payment.getPaymentNumber()
                            )
                            .active(true)
                            .build();

            cashBookTransactionRepository.save(transaction);

        } else {

            BankTransactionEntity transaction =
                    BankTransactionEntity.builder()
                            .transactionNumber(
                                    generateTransactionNumber("BT")
                            )
                            .bankAccount(payment.getBankAccount())
                            .payment(payment)
                            .party(payment.getParty())
                            .direction(direction)
                            .transactionDate(payment.getPaymentDate())
                            .amount(payment.getPaymentAmount())
                            .baseAmount(payment.getBaseAmount())
                            .exchangeRate(payment.getExchangeRate())
                            .currencyCode(payment.getCurrencyCode())
                            .referenceNumber(payment.getReferenceNumber())
                            .description(
                                    payment.getPaymentType()
                                            + " payment "
                                            + payment.getPaymentNumber()
                            )
                            .active(true)
                            .build();

            bankTransactionRepository.save(transaction);
        }
    }

    // =========================================================
    // UPDATE SOURCE PAYMENT DETAILS
    // =========================================================

    private void updateSourcePaymentDetails(
            PaymentType paymentType,
            SourceDetails source,
            BigDecimal paymentAmount,
            BigDecimal baseAmount,
            boolean partyCredit
    ) {

        // INVOICE
        if (paymentType == PaymentType.INVOICE) {

            BigDecimal completedAmount = getCompletedPaymentAmount(
                    PaymentType.INVOICE,
                    source.invoice().getId()
            );

            updateInvoicePaymentStatus(
                    source.invoice(),
                    completedAmount
            );

            return;
        }

        // EXPENSE
        if (paymentType == PaymentType.EXPENSE) {

            ExpenseEntity expense = source.expense();

            BigDecimal paid = safeAmount(expense.getPaidAmount())
                    .add(paymentAmount);

            BigDecimal due = safeAmount(expense.getTotalAmount())
                    .subtract(paid)
                    .max(ZERO);

            expense.setPaidAmount(paid);
            expense.setDueAmount(due);

            expense.setPaymentStatus(
                    due.compareTo(ZERO) == 0
                            ? ExpensePaymentStatus.PAID
                            : ExpensePaymentStatus.PARTIALLY_PAID
            );

            return;
        }

        // SALES / PURCHASE
        if (source.party() == null) {
            return;
        }

        PartyEntity party = entityManager.find(
                PartyEntity.class,
                source.party().getId(),
                LockModeType.PESSIMISTIC_WRITE
        );

        if (party == null) {
            throw new IllegalStateException("Party not found");
        }

        if (paymentType == PaymentType.SALES) {

            BigDecimal outstanding = safeAmount(
                    party.getOutstandingReceivable()
            );

            if (partyCredit) {
                outstanding = outstanding.add(baseAmount);
            } else {
                outstanding = outstanding.subtract(baseAmount).max(ZERO);
            }

            party.setOutstandingReceivable(outstanding);

        } else if (paymentType == PaymentType.PURCHASE) {

            BigDecimal outstanding = safeAmount(
                    party.getOutstandingPayable()
            );

            if (partyCredit) {
                outstanding = outstanding.add(baseAmount);
            } else {
                outstanding = outstanding.subtract(baseAmount).max(ZERO);
            }

            party.setOutstandingPayable(outstanding);
        }
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateRequest(PaymentRequestDTO request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Payment request is required"
            );
        }

        if (request.getPaymentType() == null) {
            throw new IllegalArgumentException(
                    "Payment type is required"
            );
        }

        if (request.getSourceId() == null || request.getSourceId() <= 0) {
            throw new IllegalArgumentException(
                    "Valid source document ID is required"
            );
        }

        if (request.getPaymentDate() == null) {
            throw new IllegalArgumentException(
                    "Payment date is required"
            );
        }

        boolean splitMode =
                request.getAllocations() != null
                        && !request.getAllocations().isEmpty();

        if (splitMode) {

            if (request.getPaymentAmount() != null
                    || request.getPaymentMethod() != null
                    || request.getBankAccountId() != null
                    || request.getCashAccountId() != null) {
                throw new IllegalArgumentException(
                        "Use either payment details or allocations, not both"
                );
            }

            return;
        }

        if (request.getPaymentAmount() == null
                || request.getPaymentAmount().compareTo(ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Payment amount must be greater than zero"
            );
        }

        if (request.getPaymentMethod() == null) {
            throw new IllegalArgumentException(
                    "Payment method is required"
            );
        }
    }

    // =========================================================
    // COMMON HELPERS
    // =========================================================

    private BigDecimal safeAmount(BigDecimal value) {
        return value == null ? ZERO : value;
    }

    private String generatePaymentNumber() {
        return "PAY-"
                + LocalDate.now().format(
                DateTimeFormatter.ofPattern("yyyyMMdd")
        )
                + "-"
                + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }

    private String generateTransactionNumber(String prefix) {
        return prefix + "-"
                + LocalDate.now().format(
                DateTimeFormatter.ofPattern("yyyyMMdd")
        )
                + "-"
                + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }

    // =========================================================
    // REVERSE PAYMENT
    // =========================================================

    @Override
    public PaymentResponseDTO reversePayment(Long id, String reason) {

        PaymentEntity payment = paymentRepository
                .findByIdAndActiveTrue(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Payment not found"
                ));

        entityManager.lock(
                payment,
                LockModeType.PESSIMISTIC_WRITE
        );

        if (payment.getPaymentStatus() != PaymentStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Only completed payments can be reversed"
            );
        }

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException(
                    "Reversal reason is required"
            );
        }

        if (payment.getBankAccount() != null) {
            entityManager.lock(
                    payment.getBankAccount(),
                    LockModeType.PESSIMISTIC_WRITE
            );
        }

        boolean partyCredit =
                payment.getPaymentMethod() == PaymentMethod.PARTY_CREDIT;

        // PARTY CREDIT HAS NO BANK OR CASH LEDGER TRANSACTION.
        if (!partyCredit) {

            BankTransactionEntity bankTransaction =
                    bankTransactionRepository
                            .findByPayment_IdAndActiveTrue(payment.getId())
                            .orElse(null);

            if (bankTransaction != null) {

                if (bankTransactionRepository.existsByReversalOf_Id(
                        bankTransaction.getId())) {
                    throw new IllegalStateException(
                            "Payment transaction is already reversed"
                    );
                }

                BankTransactionDirection reverseDirection =
                        bankTransaction.getDirection()
                                == BankTransactionDirection.CREDIT
                                ? BankTransactionDirection.DEBIT
                                : BankTransactionDirection.CREDIT;

                BankTransactionEntity reversal =
                        BankTransactionEntity.builder()
                                .transactionNumber(
                                        generateTransactionNumber("BT")
                                )
                                .bankAccount(bankTransaction.getBankAccount())
                                .party(bankTransaction.getParty())
                                .direction(reverseDirection)
                                .transactionDate(LocalDate.now())
                                .amount(bankTransaction.getAmount())
                                .baseAmount(bankTransaction.getBaseAmount())
                                .exchangeRate(bankTransaction.getExchangeRate())
                                .currencyCode(bankTransaction.getCurrencyCode())
                                .referenceNumber(payment.getReferenceNumber())
                                .description(
                                        "Reversal of "
                                                + bankTransaction.getTransactionNumber()
                                )
                                .reversalOf(bankTransaction)
                                .active(true)
                                .build();

                bankTransactionRepository.save(reversal);

            } else {

                CashBookTransactionEntity cashTransaction =
                        cashBookTransactionRepository
                                .findByPayment_IdAndActiveTrue(payment.getId())
                                .orElseThrow(() -> new IllegalStateException(
                                        "Payment ledger transaction not found"
                                ));

                if (cashBookTransactionRepository.existsByReversalOf_Id(
                        cashTransaction.getId())) {
                    throw new IllegalStateException(
                            "Payment transaction is already reversed"
                    );
                }

                BankTransactionDirection reverseDirection =
                        cashTransaction.getDirection()
                                == BankTransactionDirection.CREDIT
                                ? BankTransactionDirection.DEBIT
                                : BankTransactionDirection.CREDIT;

                CashBookTransactionEntity reversal =
                        CashBookTransactionEntity.builder()
                                .transactionNumber(
                                        generateTransactionNumber("CBT")
                                )
                                .cashAccount(cashTransaction.getCashAccount())
                                .direction(reverseDirection)
                                .transactionDate(LocalDate.now())
                                .amount(cashTransaction.getAmount())
                                .baseAmount(cashTransaction.getBaseAmount())
                                .exchangeRate(cashTransaction.getExchangeRate())
                                .currencyCode(cashTransaction.getCurrencyCode())
                                .referenceNumber(payment.getReferenceNumber())
                                .description(
                                        "Reversal of "
                                                + cashTransaction.getTransactionNumber()
                                )
                                .reversalOf(cashTransaction)
                                .active(true)
                                .build();

                cashBookTransactionRepository.save(reversal);
            }
        }

        // RESTORE ACCOUNT BALANCES.
        if (!partyCredit) {
            updateBankAccountBalance(payment, true);
            updateCashAccountBalance(payment, true);
        }

        /*
         * IMPORTANT:
         * Mark the payment reversed BEFORE recalculating invoice paid amount.
         * The repository query must no longer count this payment as COMPLETED.
         */
        payment.setPaymentStatus(PaymentStatus.REVERSED);
        payment.setReversalReason(reason);

        // Restore party, expense or invoice details.
        restoreSourcePaymentDetails(payment);

        return paymentMapper.toResponse(
                paymentRepository.save(payment)
        );
    }

    // =========================================================
    // RESTORE SOURCE PAYMENT DETAILS
    // =========================================================

    private void restoreSourcePaymentDetails(PaymentEntity payment) {

        // INVOICE
        if (payment.getPaymentType() == PaymentType.INVOICE) {

            InvoiceEntity invoice = invoiceRepository
                    .findByIdAndActiveTrue(payment.getSourceId())
                    .orElseThrow(() -> new IllegalStateException(
                            "Invoice not found while reversing payment"
                    ));

            entityManager.lock(
                    invoice,
                    LockModeType.PESSIMISTIC_WRITE
            );

            BigDecimal completedAmount = getCompletedPaymentAmount(
                    PaymentType.INVOICE,
                    invoice.getId()
            );

            updateInvoicePaymentStatus(
                    invoice,
                    completedAmount
            );

            return;
        }

        // EXPENSE
        if (payment.getPaymentType() == PaymentType.EXPENSE) {

            ExpenseEntity expense = expenseRepository
                    .findByIdAndActiveTrue(payment.getSourceId())
                    .orElseThrow(() -> new IllegalStateException(
                            "Expense not found while reversing payment"
                    ));

            entityManager.lock(
                    expense,
                    LockModeType.PESSIMISTIC_WRITE
            );

            BigDecimal paid = safeAmount(expense.getPaidAmount())
                    .subtract(payment.getPaymentAmount())
                    .max(ZERO);

            BigDecimal due = safeAmount(expense.getTotalAmount())
                    .subtract(paid)
                    .max(ZERO);

            expense.setPaidAmount(paid);
            expense.setDueAmount(due);

            expense.setPaymentStatus(
                    paid.compareTo(ZERO) == 0
                            ? ExpensePaymentStatus.UNPAID
                            : ExpensePaymentStatus.PARTIALLY_PAID
            );

            return;
        }

        // SALES / PURCHASE
        if (payment.getParty() == null) {
            return;
        }

        PartyEntity party = entityManager.find(
                PartyEntity.class,
                payment.getParty().getId(),
                LockModeType.PESSIMISTIC_WRITE
        );

        if (party == null) {
            throw new IllegalStateException(
                    "Party not found while reversing payment"
            );
        }

        boolean partyCredit =
                payment.getPaymentMethod() == PaymentMethod.PARTY_CREDIT;

        if (payment.getPaymentType() == PaymentType.SALES) {

            BigDecimal outstanding = safeAmount(
                    party.getOutstandingReceivable()
            );

            if (partyCredit) {
                outstanding = outstanding
                        .subtract(payment.getBaseAmount())
                        .max(ZERO);
            } else {
                outstanding = outstanding.add(payment.getBaseAmount());
            }

            party.setOutstandingReceivable(outstanding);

        } else if (payment.getPaymentType() == PaymentType.PURCHASE) {

            BigDecimal outstanding = safeAmount(
                    party.getOutstandingPayable()
            );

            if (partyCredit) {
                outstanding = outstanding
                        .subtract(payment.getBaseAmount())
                        .max(ZERO);
            } else {
                outstanding = outstanding.add(payment.getBaseAmount());
            }

            party.setOutstandingPayable(outstanding);
        }
    }

    // =========================================================
    // BANK ACCOUNT BALANCE UPDATE
    // =========================================================

    private void updateBankAccountBalance(
            PaymentEntity payment,
            boolean reversal
    ) {

        if (payment.getBankAccount() == null) {
            return;
        }

        BankAccount bankAccount = payment.getBankAccount();

        BigDecimal amount = getBankAccountAmount(
                payment,
                bankAccount
        );

        boolean isCredit =
                payment.getPaymentDirection() == PaymentDirection.RECEIVED;

        if (reversal) {
            isCredit = !isCredit;
        }

        BigDecimal currentBalance = safeAmount(
                bankAccount.getCurrentBalance()
        );

        if (isCredit) {
            bankAccount.setCurrentBalance(
                    currentBalance.add(amount)
            );
        } else {
            bankAccount.setCurrentBalance(
                    currentBalance.subtract(amount)
            );
        }

        bankAccountRepository.save(bankAccount);
    }

    // =========================================================
    // GET BANK ACCOUNT AMOUNT IN ACCOUNT CURRENCY
    // =========================================================

    private BigDecimal getBankAccountAmount(
            PaymentEntity payment,
            BankAccount bankAccount
    ) {

        String accountCurrency = bankAccount.getCurrency();
        String paymentCurrency = payment.getCurrencyCode();

        if (accountCurrency == null || accountCurrency.isBlank()) {
            throw new IllegalStateException(
                    "Bank account currency is not configured."
            );
        }

        if (paymentCurrency == null || paymentCurrency.isBlank()) {
            throw new IllegalStateException(
                    "Payment currency is not configured."
            );
        }

        if (accountCurrency.equalsIgnoreCase(paymentCurrency)) {
            return payment.getPaymentAmount();
        }

        if ("INR".equalsIgnoreCase(accountCurrency)) {
            return payment.getBaseAmount();
        }

        throw new IllegalArgumentException(
                "Payment currency does not match bank account currency. "
                        + "Bank account currency: " + accountCurrency
                        + ", payment currency: " + paymentCurrency
        );
    }

    // =========================================================
    // CASH ACCOUNT BALANCE UPDATE
    // =========================================================

    private void updateCashAccountBalance(
            PaymentEntity payment,
            boolean reversal
    ) {

        if (payment.getPaymentMethod() != PaymentMethod.CASH) {
            return;
        }

        CashAccountEntity cashAccount = payment.getCashAccount();

        if (cashAccount == null) {
            throw new IllegalArgumentException(
                    "Cash account not found for cash payment"
            );
        }

        BigDecimal amount;

        if (payment.getCurrencyCode() != null
                && payment.getCurrencyCode().equalsIgnoreCase(
                cashAccount.getCurrency()
        )) {

            amount = payment.getPaymentAmount();

        } else if ("INR".equalsIgnoreCase(cashAccount.getCurrency())) {

            amount = payment.getBaseAmount();

        } else {

            throw new IllegalArgumentException(
                    "Cash account currency does not match payment currency"
            );
        }

        boolean received =
                payment.getPaymentDirection() == PaymentDirection.RECEIVED;

        if (reversal) {
            received = !received;
        }

        BigDecimal currentBalance = safeAmount(
                cashAccount.getCurrentBalance()
        );

        if (received) {
            cashAccount.setCurrentBalance(
                    currentBalance.add(amount)
            );
        } else {
            cashAccount.setCurrentBalance(
                    currentBalance.subtract(amount)
            );
        }

        cashAccountRepository.save(cashAccount);
    }

    // =========================================================
    // PARTY CREDIT VALIDATION
    // =========================================================

    private PartyEntity validateAndLockPartyCredit(
            PaymentType paymentType,
            PartyEntity sourceParty,
            BigDecimal baseAmount
    ) {

        if (paymentType == PaymentType.EXPENSE
                || paymentType == PaymentType.INVOICE) {
            throw new IllegalArgumentException(
                    "Party credit is not supported for this payment type"
            );
        }

        if (sourceParty == null || sourceParty.getId() == null) {
            throw new IllegalArgumentException(
                    "Party is required for party credit payment"
            );
        }

        PartyEntity party = entityManager.find(
                PartyEntity.class,
                sourceParty.getId(),
                LockModeType.PESSIMISTIC_WRITE
        );

        if (party == null || !Boolean.TRUE.equals(party.getActive())) {
            throw new IllegalArgumentException(
                    "Party not found or inactive"
            );
        }

        BigDecimal creditLimit = safeAmount(
                party.getCreditLimit()
        );

        if (creditLimit.compareTo(ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Credit limit is not configured for this party"
            );
        }

        BigDecimal outstanding;

        if (paymentType == PaymentType.SALES) {

            if (party.getPartyType() != PartyType.CUSTOMER) {
                throw new IllegalArgumentException(
                        "Only customer parties can use credit for sales"
                );
            }

            outstanding = safeAmount(
                    party.getOutstandingReceivable()
            );

        } else if (paymentType == PaymentType.PURCHASE) {

            if (party.getPartyType() != PartyType.SUPPLIER) {
                throw new IllegalArgumentException(
                        "Only supplier parties can use credit for purchases"
                );
            }

            outstanding = safeAmount(
                    party.getOutstandingPayable()
            );

        } else {
            throw new IllegalArgumentException(
                    "Party credit is not supported for this payment type"
            );
        }

        BigDecimal availableCredit = creditLimit.subtract(outstanding);

        if (baseAmount.compareTo(availableCredit) > 0) {
            throw new IllegalArgumentException(
                    "Insufficient party credit. Available credit: "
                            + availableCredit
            );
        }

        return party;
    }

    // =========================================================
    // CREATE PAYMENT ALLOCATION
    // =========================================================

    private PaymentEntity createPaymentAllocation(
            PaymentRequestDTO request,
            SourceDetails source,
            Currency sourceCurrency,
            BigDecimal exchangeRate,
            PaymentAllocationRequestDTO allocation
    ) {

        PaymentMethod paymentMethod = allocation.getPaymentMethod();

        boolean partyCredit =
                paymentMethod == PaymentMethod.PARTY_CREDIT;

        BigDecimal paymentAmount = allocation.getPaymentAmount();

        BigDecimal baseAmount = paymentAmount
                .multiply(exchangeRate)
                .setScale(AMOUNT_SCALE, RoundingMode.HALF_UP);

        PaymentDirection direction =
                switch (request.getPaymentType()) {
                    case SALES, INVOICE -> PaymentDirection.RECEIVED;
                    case PURCHASE, EXPENSE -> PaymentDirection.PAID;
                };

        PartyEntity party = null;

        if (partyCredit) {
            party = validateAndLockPartyCredit(
                    request.getPaymentType(),
                    source.party(),
                    baseAmount
            );
        }

        BankAccount bankAccount = null;
        CashAccountEntity cashAccount = null;

        if (!partyCredit) {

            if (paymentMethod == PaymentMethod.CASH) {

                cashAccount = cashAccountRepository
                        .findByIdAndStatusNotForUpdate(
                                allocation.getCashAccountId(),
                                CashAccountStatus.DELETED.name()
                        )
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Cash account not found or inactive"
                        ));
            } else {

                bankAccount = bankAccountRepository
                        .findById(allocation.getBankAccountId())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Bank account not found"
                        ));

                // Lock account to prevent concurrent payments
                entityManager.lock(
                        bankAccount,
                        LockModeType.PESSIMISTIC_WRITE
                );

                if (!Boolean.TRUE.equals(bankAccount.getActive())
                        || bankAccount.getStatus() != BankAccountStatus.ACTIVE) {
                    throw new IllegalArgumentException(
                            "Selected bank account is inactive"
                    );
                }

                // Validate balance for outgoing payments only.
                // Applies to BANK_TRANSFER, UPI, CARD and CHEQUE.
                if (direction == PaymentDirection.PAID) {

                    validateSufficientBankBalance(
                            bankAccount,
                            paymentAmount,
                            baseAmount,
                            sourceCurrency.getCurrencyCode()
                    );
                }
            }
        }

        PaymentEntity payment = PaymentEntity.builder()
                .paymentNumber(generatePaymentNumber())
                .paymentType(request.getPaymentType())
                .paymentDirection(direction)

                .sourceId(request.getSourceId())
                .sourceNumber(source.sourceNumber())

                .paymentDate(request.getPaymentDate())
                .paymentAmount(paymentAmount)
                .baseAmount(baseAmount)
                .exchangeRate(exchangeRate)

                .currency(sourceCurrency)
                .currencyCode(sourceCurrency.getCurrencyCode())

                .paymentMethod(paymentMethod)

                .bankAccount(bankAccount)
                .cashAccount(cashAccount)

                .customer(source.customer())
                .party(partyCredit ? party : source.party())

                .referenceNumber(request.getReferenceNumber())
                .notes(request.getNotes())

                .paymentStatus(PaymentStatus.COMPLETED)
                .active(true)
                .build();

        payment = paymentRepository.save(payment);

        if (!partyCredit) {

            createLedgerTransaction(payment);

            updateBankAccountBalance(payment, false);
            updateCashAccountBalance(payment, false);
        }

        updateSourcePaymentDetails(
                request.getPaymentType(),
                source,
                paymentAmount,
                baseAmount,
                partyCredit
        );

        return payment;
    }

    // =========================================================
    // VALIDATE ALLOCATION
    // =========================================================

    private void validateAllocation(
            PaymentType paymentType,
            PaymentAllocationRequestDTO allocation
    ) {

        if (allocation == null) {
            throw new IllegalArgumentException(
                    "Payment allocation is required"
            );
        }

        if (allocation.getPaymentAmount() == null
                || allocation.getPaymentAmount().compareTo(ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Payment allocation amount must be greater than zero"
            );
        }

        if (allocation.getPaymentMethod() == null) {
            throw new IllegalArgumentException(
                    "Payment allocation method is required"
            );
        }

        if (allocation.getPaymentMethod() == PaymentMethod.PARTY_CREDIT) {

            if (paymentType == PaymentType.EXPENSE
                    || paymentType == PaymentType.INVOICE) {
                throw new IllegalArgumentException(
                        "Party Credit is not allowed for this payment type"
                );
            }
        }

        paymentValidation.validatePaymentAccount(allocation);
    }

    // =========================================================
// VALIDATE SUFFICIENT BANK ACCOUNT BALANCE
// =========================================================

    private void validateSufficientBankBalance(
            BankAccount bankAccount,
            BigDecimal paymentAmount,
            BigDecimal baseAmount,
            String paymentCurrency
    ) {

        if (bankAccount == null) {
            throw new IllegalArgumentException(
                    "Bank account is required for this payment"
            );
        }

        String accountCurrency = bankAccount.getCurrency();

        if (accountCurrency == null || accountCurrency.isBlank()) {
            throw new IllegalStateException(
                    "Bank account currency is not configured"
            );
        }

        if (paymentCurrency == null || paymentCurrency.isBlank()) {
            throw new IllegalStateException(
                    "Payment currency is not configured"
            );
        }

        BigDecimal requiredAmount;

        if (accountCurrency.equalsIgnoreCase(paymentCurrency)) {

            requiredAmount = paymentAmount;

        } else if ("INR".equalsIgnoreCase(accountCurrency)) {

            requiredAmount = baseAmount;

        } else {

            throw new IllegalArgumentException(
                    "Payment currency does not match bank account currency. "
                            + "Bank account currency: " + accountCurrency
                            + ", payment currency: " + paymentCurrency
            );
        }

        BigDecimal availableBalance = safeAmount(
                bankAccount.getCurrentBalance()
        );

        if (availableBalance.compareTo(requiredAmount) < 0) {

            throw new IllegalArgumentException(
                    "Insufficient bank account balance. "
                            + "Available balance: " + availableBalance
                            + " " + accountCurrency
                            + ", Required amount: " + requiredAmount
                            + " " + accountCurrency
            );
        }
    }
}