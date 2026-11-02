
package com.ims.service.impl.payment;

import com.ims.common.PageResponse;
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
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
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

        paymentValidation.validatePaymentAccount(request);

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

        BigDecimal dueAmount = source.totalAmount().subtract(alreadyPaid);

        if (request.getPaymentAmount().compareTo(dueAmount) > 0) {
            throw new IllegalArgumentException(
                    "Payment amount cannot exceed the remaining due amount: "
                            + dueAmount
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

        BigDecimal baseAmount = request.getPaymentAmount()
                .multiply(exchangeRate)
                .setScale(AMOUNT_SCALE, RoundingMode.HALF_UP);

        PaymentDirection direction =
                request.getPaymentType() == PaymentType.SALES
                        ? PaymentDirection.RECEIVED
                        : PaymentDirection.PAID;

        BankAccount bankAccount = null;
        CashAccountEntity cashAccount = null;

        if (request.getPaymentMethod() == PaymentMethod.CASH) {

            cashAccount = cashAccountRepository
                    .findActiveByIdForUpdate(request.getCashAccountId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Cash account not found or inactive"
                    ));

        } else {

            bankAccount = bankAccountRepository
                    .findById(request.getBankAccountId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Bank account not found"
                    ));

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
        }

        PaymentEntity payment = PaymentEntity.builder()
                .paymentNumber(generatePaymentNumber())
                .paymentType(request.getPaymentType())
                .paymentDirection(direction)

                .sourceId(request.getSourceId())
                .sourceNumber(source.sourceNumber())

                .paymentDate(request.getPaymentDate())
                .paymentAmount(request.getPaymentAmount())
                .baseAmount(baseAmount)
                .exchangeRate(exchangeRate)

                .currency(sourceCurrency)
                .currencyCode(sourceCurrency.getCurrencyCode())

                .paymentMethod(request.getPaymentMethod())

                .bankAccount(bankAccount)
                .cashAccount(cashAccount)

                .customer(source.customer())
                .party(source.party())

                .referenceNumber(request.getReferenceNumber())
                .notes(request.getNotes())

                .paymentStatus(PaymentStatus.COMPLETED)
                .active(true)
                .build();

        payment = paymentRepository.save(payment);

        // Create bank or cash ledger transaction.
        createLedgerTransaction(payment);

        // Update bank account balance.
        // Cash payments are skipped here.
        updateBankAccountBalance(payment, false);
        updateCashAccountBalance(payment, false);
        // Update expense / party payment details.
        updateSourcePaymentDetails(
                request.getPaymentType(),
                source,
                request.getPaymentAmount(),
                baseAmount
        );

        return paymentMapper.toResponse(payment);
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
                        expense
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
            ExpenseEntity expense
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
            BigDecimal baseAmount
    ) {

        if (paymentType == PaymentType.EXPENSE) {

            ExpenseEntity expense = source.expense();

            BigDecimal paid = safeAmount(expense.getPaidAmount())
                    .add(paymentAmount);

            BigDecimal due = safeAmount(expense.getTotalAmount())
                    .subtract(paid)
                    .max(ZERO);

            expense.setPaidAmount(paid);
            expense.setDueAmount(due);

            if (due.compareTo(ZERO) == 0) {
                expense.setPaymentStatus(ExpensePaymentStatus.PAID);
            } else {
                expense.setPaymentStatus(
                        ExpensePaymentStatus.PARTIALLY_PAID
                );
            }

            return;
        }

        if (source.party() != null) {

            PartyEntity party = entityManager.find(
                    PartyEntity.class,
                    source.party().getId(),
                    LockModeType.PESSIMISTIC_WRITE
            );

            if (party != null) {

                if (paymentType == PaymentType.SALES) {

                    party.setOutstandingReceivable(
                            safeAmount(party.getOutstandingReceivable())
                                    .subtract(baseAmount)
                                    .max(ZERO)
                    );

                } else if (paymentType == PaymentType.PURCHASE) {

                    party.setOutstandingPayable(
                            safeAmount(party.getOutstandingPayable())
                                    .subtract(baseAmount)
                                    .max(ZERO)
                    );
                }
            }
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

        // Restore bank account balance.
        updateBankAccountBalance(payment, true);
        updateCashAccountBalance(payment, true);
        // Restore expense / party payment details.
        restoreSourcePaymentDetails(payment);

        payment.setPaymentStatus(PaymentStatus.REVERSED);
        payment.setReversalReason(reason);

        return paymentMapper.toResponse(
                paymentRepository.save(payment)
        );
    }

    // =========================================================
    // RESTORE SOURCE PAYMENT DETAILS
    // =========================================================

    private void restoreSourcePaymentDetails(PaymentEntity payment) {

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

        if (payment.getParty() != null) {

            PartyEntity party = entityManager.find(
                    PartyEntity.class,
                    payment.getParty().getId(),
                    LockModeType.PESSIMISTIC_WRITE
            );

            if (party != null) {

                if (payment.getPaymentType() == PaymentType.SALES) {

                    party.setOutstandingReceivable(
                            safeAmount(party.getOutstandingReceivable())
                                    .add(payment.getBaseAmount())
                    );

                } else if (payment.getPaymentType() == PaymentType.PURCHASE) {

                    party.setOutstandingPayable(
                            safeAmount(party.getOutstandingPayable())
                                    .add(payment.getBaseAmount())
                    );
                }
            }
        }
    }

    // =========================================================
    // BANK ACCOUNT BALANCE UPDATE
    // =========================================================

    private void updateBankAccountBalance(
            PaymentEntity payment,
            boolean reversal
    ) {

        // Cash payments do not have a bank account.
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

        // Reverse the original transaction direction when reversing.
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

        // Reverse the original direction when reversing a payment.
        if (reversal) {
            received = !received;
        }

        BigDecimal currentBalance = cashAccount.getCurrentBalance();

        if (received) {
            cashAccount.setCurrentBalance(currentBalance.add(amount));
        } else {
            cashAccount.setCurrentBalance(currentBalance.subtract(amount));
        }

        cashAccountRepository.save(cashAccount);
    }
}
