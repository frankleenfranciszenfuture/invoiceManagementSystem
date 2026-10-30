
package com.ims.service.impl.payment;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;

import com.ims.dtos.exchange.ExchangeRateResponseDTO;
import com.ims.dtos.payment.PaymentFilterDTO;
import com.ims.dtos.payment.PaymentRequestDTO;
import com.ims.dtos.payment.PaymentResponseDTO;

import com.ims.entity.BankAccount;
import com.ims.entity.BankTransactionEntity;
import com.ims.entity.Currency;
import com.ims.entity.PartyEntity;
import com.ims.entity.PaymentEntity;

import com.ims.enums.PaymentMethod;
import com.ims.enums.BankTransactionDirection;
import com.ims.enums.PaymentDirection;
import com.ims.enums.PaymentReferenceType;
import com.ims.enums.PaymentStatus;

import com.ims.repository.BankAccountRepository;
import com.ims.repository.BankTransactionRepository;
import com.ims.repository.CurrencyRepository;
import com.ims.repository.PartyRepository;
import com.ims.repository.PaymentRepository;

import com.ims.service.serviceInterface.currency.ExchangeRateService;
import com.ims.service.serviceInterface.payment.PaymentService;
import com.ims.service.serviceInterface.saleOrder.SaleOrderService;

import com.ims.utils.specification.PaymentSpecification;
import com.ims.utils.validation.PaymentValidation;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private static final String BASE_CURRENCY_CODE = "INR";

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final PaymentRepository paymentRepository;
    private final BankTransactionRepository bankTransactionRepository;
    private final PartyRepository partyRepository;
    private final BankAccountRepository bankAccountRepository;
    private final CurrencyRepository currencyRepository;

    private final PaymentValidation paymentValidation;
    private final ExchangeRateService exchangeRateService;

    private final SaleOrderService saleOrderService;


    // =========================================================
    // CREATE PAYMENT
    // =========================================================

    @Override
    public ApiResponse<PaymentResponseDTO> createPayment(
            PaymentRequestDTO request
    ) {

        paymentValidation.validatePaymentRequest(request);

        validateReferenceDirection(
                request.getDirection(),
                request.getReferenceType()
        );

        PartyEntity party = paymentValidation.validatePartyType(
                request.getPartyId(),
                request.getDirection()
        );

        BankAccount bankAccount = null;

        if (request.getBankAccountId() != null) {
            bankAccount = paymentValidation.validateBankAccount(
                    request.getBankAccountId()
            );
        }

        Currency paymentCurrency = getActiveCurrency(
                request.getCurrencyCode()
        );

        BigDecimal exchangeRate = getRateToInr(
                paymentCurrency,
                request.getPaymentDate()
        );

        BigDecimal baseAmount = request.getAmount()
                .multiply(exchangeRate)
                .setScale(2, RoundingMode.HALF_UP);

        boolean pending = request.getPaymentMethod()
                == PaymentMethod.CHEQUE;

        PaymentEntity payment = PaymentEntity.builder()
                .paymentNumber(generatePaymentNumber())
                .direction(request.getDirection())
                .referenceType(request.getReferenceType())
                .referenceId(request.getReferenceId())
                .party(party)
                .bankAccount(bankAccount)
                .paymentDate(request.getPaymentDate())
                .amount(request.getAmount())
                .baseAmount(baseAmount)
                .exchangeRate(exchangeRate)
                .currencyCode(paymentCurrency.getCurrencyCode())
                .paymentMethod(request.getPaymentMethod())
                .status(
                        pending
                                ? PaymentStatus.PENDING
                                : PaymentStatus.COMPLETED
                )
                .transactionReference(request.getTransactionReference())
                .notes(request.getNotes())
                .build();

        payment = paymentRepository.save(payment);

        if (!pending) {

            // Sale Order allocation or normal party balance update.
            applyReferenceBalance(payment, false);

            if (bankAccount != null) {
                createBankTransaction(payment, bankAccount);
            }
        }

        return ApiResponse.success(
                toResponse(payment),
                pending
                        ? "Payment created successfully and is pending"
                        : "Payment created successfully"
        );
    }


    // =========================================================
    // GET PAYMENT BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PaymentResponseDTO> getPaymentById(
            Long paymentId
    ) {

        PaymentEntity payment = getDetailedPayment(paymentId);

        return ApiResponse.success(
                toResponse(payment),
                "Payment details fetched successfully"
        );
    }


    // =========================================================
    // GET ALL PAYMENTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<PaymentResponseDTO>> getAllPayments(
            PaymentFilterDTO filter,
            Pageable pageable
    ) {

        Page<PaymentEntity> paymentPage = paymentRepository.findAll(
                PaymentSpecification.withFilters(filter),
                pageable
        );

        Page<PaymentResponseDTO> responsePage =
                paymentPage.map(this::toResponse);

        PageResponse<PaymentResponseDTO> response =
                PageResponse.<PaymentResponseDTO>builder()
                        .content(responsePage.getContent())
                        .pageNumber(responsePage.getNumber())
                        .pageSize(responsePage.getSize())
                        .totalElements(responsePage.getTotalElements())
                        .totalPages(responsePage.getTotalPages())
                        .last(responsePage.isLast())
                        .build();

        return ApiResponse.success(
                response,
                "Payments fetched successfully"
        );
    }


    // =========================================================
    // COMPLETE PAYMENT
    // =========================================================

    @Override
    public ApiResponse<PaymentResponseDTO> completePayment(
            Long paymentId
    ) {

        PaymentEntity payment = getDetailedPayment(paymentId);

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Only pending payments can be completed"
            );
        }

        // Set completed before allocation because SaleOrderService
        // accepts only completed payments.
        payment.setStatus(PaymentStatus.COMPLETED);

        paymentRepository.save(payment);

        applyReferenceBalance(payment, false);

        if (payment.getBankAccount() != null) {
            createBankTransaction(
                    payment,
                    payment.getBankAccount()
            );
        }

        payment = paymentRepository.save(payment);

        return ApiResponse.success(
                toResponse(payment),
                "Payment completed successfully"
        );
    }


    // =========================================================
    // CANCEL PAYMENT
    // =========================================================

    @Override
    public ApiResponse<PaymentResponseDTO> cancelPayment(
            Long paymentId
    ) {

        PaymentEntity payment = getDetailedPayment(paymentId);

        if (payment.getStatus() == PaymentStatus.CANCELLED) {
            throw new IllegalArgumentException(
                    "Payment is already cancelled"
            );
        }

        if (payment.getStatus() == PaymentStatus.COMPLETED) {

            // Reverse order allocation or normal party balance.
            applyReferenceBalance(payment, true);

            BankTransactionEntity originalTransaction =
                    bankTransactionRepository
                            .findByPayment_IdAndActiveTrue(payment.getId())
                            .orElse(null);

            if (originalTransaction != null) {
                createReversalTransaction(originalTransaction);
            }
        }

        payment.setStatus(PaymentStatus.CANCELLED);

        payment = paymentRepository.save(payment);

        return ApiResponse.success(
                toResponse(payment),
                "Payment cancelled successfully"
        );
    }


    // =========================================================
    // REFERENCE BALANCE INTEGRATION
    // =========================================================

    /**
     * Routes payment accounting to the correct module.
     *
     * SALE_ORDER:
     * SaleOrderService manages order paid amount, outstanding amount,
     * payment status and customer outstanding receivable.
     *
     * ADVANCE:
     * No direct party receivable/payable adjustment here.
     *
     * Other references:
     * Existing party balance logic is retained.
     */
    private void applyReferenceBalance(
            PaymentEntity payment,
            boolean reverse
    ) {

        if (payment.getReferenceType() == PaymentReferenceType.SALE_ORDER) {

            if (reverse) {
                saleOrderService.reversePayment(payment);
            } else {
                saleOrderService.allocatePayment(payment);
            }

            return;
        }

        if (payment.getReferenceType() == PaymentReferenceType.ADVANCE) {
            return;
        }

        applyPartyBalance(payment, reverse);
    }


    // =========================================================
    // PARTY BALANCE UPDATE
    // =========================================================

    private void applyPartyBalance(
            PaymentEntity payment,
            boolean reverse
    ) {

        if (payment.getReferenceType() == PaymentReferenceType.SALE_ORDER
                || payment.getReferenceType() == PaymentReferenceType.ADVANCE) {
            return;
        }

        PartyEntity party = partyRepository
                .findActivePartyByIdForUpdate(payment.getParty().getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Active party not found"
                ));

        BigDecimal amount = payment.getBaseAmount();

        if (amount == null || amount.compareTo(ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Payment base amount must be greater than zero"
            );
        }

        if (payment.getDirection() == PaymentDirection.RECEIVED) {

            BigDecimal outstanding = defaultZero(
                    party.getOutstandingReceivable()
            );

            if (reverse) {

                party.setOutstandingReceivable(
                        outstanding.add(amount)
                );

            } else {

                if (outstanding.compareTo(amount) < 0) {
                    throw new IllegalArgumentException(
                            "Payment exceeds customer outstanding receivable"
                    );
                }

                party.setOutstandingReceivable(
                        outstanding.subtract(amount)
                );
            }

        } else if (payment.getDirection() == PaymentDirection.PAID) {

            BigDecimal outstanding = defaultZero(
                    party.getOutstandingPayable()
            );

            if (reverse) {

                party.setOutstandingPayable(
                        outstanding.add(amount)
                );

            } else {

                if (outstanding.compareTo(amount) < 0) {
                    throw new IllegalArgumentException(
                            "Payment exceeds supplier outstanding payable"
                    );
                }

                party.setOutstandingPayable(
                        outstanding.subtract(amount)
                );
            }
        }

        partyRepository.save(party);
    }


    // =========================================================
    // CREATE BANK TRANSACTION
    // =========================================================

    private void createBankTransaction(
            PaymentEntity payment,
            BankAccount bankAccount
    ) {

        Currency bankCurrency = getActiveCurrency(
                bankAccount.getCurrency()
        );

        BigDecimal bankCurrencyToInrRate = getRateToInr(
                bankCurrency,
                payment.getPaymentDate()
        );

        /*
         * Payment baseAmount is INR.
         * Convert INR into bank account currency.
         */
        BigDecimal bankAmount = payment.getBaseAmount()
                .divide(
                        bankCurrencyToInrRate,
                        bankCurrency.getDecimalPlaces(),
                        RoundingMode.HALF_UP
                );

        BankTransactionDirection direction =
                payment.getDirection() == PaymentDirection.RECEIVED
                        ? BankTransactionDirection.CREDIT
                        : BankTransactionDirection.DEBIT;

        BankTransactionEntity transaction =
                BankTransactionEntity.builder()
                        .transactionNumber(generateTransactionNumber())
                        .bankAccount(bankAccount)
                        .payment(payment)
                        .party(payment.getParty())
                        .direction(direction)
                        .transactionDate(payment.getPaymentDate())
                        .amount(bankAmount)
                        .baseAmount(payment.getBaseAmount())
                        .exchangeRate(bankCurrencyToInrRate)
                        .currencyCode(bankCurrency.getCurrencyCode())
                        .referenceNumber(payment.getTransactionReference())
                        .description(
                                "Payment " + payment.getPaymentNumber()
                        )
                        .build();

        transaction = bankTransactionRepository.save(transaction);

        payment.setBankTransaction(transaction);

        paymentRepository.save(payment);
    }


    // =========================================================
    // REVERSE BANK TRANSACTION
    // =========================================================

    private void createReversalTransaction(
            BankTransactionEntity original
    ) {

        boolean alreadyReversed =
                bankTransactionRepository.existsByReversalOf_Id(
                        original.getId()
                );

        if (alreadyReversed) {
            throw new IllegalArgumentException(
                    "Bank transaction has already been reversed"
            );
        }

        BankTransactionDirection reverseDirection =
                original.getDirection() == BankTransactionDirection.CREDIT
                        ? BankTransactionDirection.DEBIT
                        : BankTransactionDirection.CREDIT;

        BankTransactionEntity reversal =
                BankTransactionEntity.builder()
                        .transactionNumber(generateTransactionNumber())
                        .bankAccount(original.getBankAccount())
                        .payment(null)
                        .party(original.getParty())
                        .direction(reverseDirection)
                        .transactionDate(LocalDate.now())
                        .amount(original.getAmount())
                        .baseAmount(original.getBaseAmount())
                        .exchangeRate(original.getExchangeRate())
                        .currencyCode(original.getCurrencyCode())
                        .referenceNumber(original.getTransactionNumber())
                        .description(
                                "Reversal of transaction "
                                        + original.getTransactionNumber()
                        )
                        .reversalOf(original)
                        .build();

        bankTransactionRepository.save(reversal);
    }


    // =========================================================
    // CURRENCY CONVERSION
    // =========================================================

    private Currency getActiveCurrency(String currencyCode) {

        if (currencyCode == null || currencyCode.isBlank()) {
            throw new IllegalArgumentException(
                    "Currency code is required"
            );
        }

        Currency currency = currencyRepository
                .findByCurrencyCodeIgnoreCase(currencyCode.trim())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Currency not found: " + currencyCode
                ));

        if (!Boolean.TRUE.equals(currency.getActive())) {
            throw new IllegalArgumentException(
                    "Currency is inactive: " + currencyCode
            );
        }

        return currency;
    }


    /**
     * Returns INR value for one unit of the given currency.
     */
    private BigDecimal getRateToInr(
            Currency currency,
            LocalDate date
    ) {

        if (BASE_CURRENCY_CODE.equalsIgnoreCase(
                currency.getCurrencyCode()
        )) {
            return BigDecimal.ONE;
        }

        Currency inr = getActiveCurrency(BASE_CURRENCY_CODE);

        ApiResponse<ExchangeRateResponseDTO> response =
                exchangeRateService.getRate(
                        currency.getId(),
                        inr.getId(),
                        date
                );

        if (response == null
                || !response.isSuccess()
                || response.getData() == null
                || response.getData().getRate() == null
                || response.getData().getRate().compareTo(ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Exchange rate not available for "
                            + currency.getCurrencyCode()
                            + " to INR"
            );
        }

        return response.getData().getRate();
    }


    // =========================================================
    // VALIDATE REFERENCE DIRECTION
    // =========================================================

    private void validateReferenceDirection(
            PaymentDirection direction,
            PaymentReferenceType referenceType
    ) {

        if (referenceType == PaymentReferenceType.SALE_ORDER
                && direction != PaymentDirection.RECEIVED) {

            throw new IllegalArgumentException(
                    "Sale order payment direction must be RECEIVED"
            );
        }

        if (referenceType == PaymentReferenceType.PURCHASE_ORDER
                && direction != PaymentDirection.PAID) {

            throw new IllegalArgumentException(
                    "Purchase order payment direction must be PAID"
            );
        }
    }


    // =========================================================
    // FIND PAYMENT
    // =========================================================

    private PaymentEntity getDetailedPayment(Long paymentId) {

        if (paymentId == null || paymentId <= 0) {
            throw new IllegalArgumentException(
                    "Valid payment ID is required"
            );
        }

        return paymentRepository.findDetailedById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Payment not found with ID: " + paymentId
                ));
    }


    // =========================================================
    // RESPONSE MAPPER
    // =========================================================

    private PaymentResponseDTO toResponse(PaymentEntity payment) {

        PaymentResponseDTO response = new PaymentResponseDTO();

        response.setId(payment.getId());
        response.setPaymentNumber(payment.getPaymentNumber());
        response.setDirection(payment.getDirection());
        response.setReferenceType(payment.getReferenceType());
        response.setReferenceId(payment.getReferenceId());

        if (payment.getParty() != null) {
            response.setPartyId(payment.getParty().getId());
            response.setPartyCode(payment.getParty().getPartyCode());
            response.setPartyName(payment.getParty().getCompanyName());
        }

        if (payment.getBankAccount() != null) {
            response.setBankAccountId(payment.getBankAccount().getId());
            response.setBankAccountName(
                    payment.getBankAccount().getAccountName()
            );
        }

        response.setPaymentDate(payment.getPaymentDate());
        response.setAmount(payment.getAmount());
        response.setBaseAmount(payment.getBaseAmount());
        response.setExchangeRate(payment.getExchangeRate());
        response.setCurrencyCode(payment.getCurrencyCode());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setStatus(payment.getStatus());

        response.setTransactionReference(
                payment.getTransactionReference()
        );

        response.setNotes(payment.getNotes());

        if (payment.getBankTransaction() != null) {
            response.setBankTransactionId(
                    payment.getBankTransaction().getId()
            );

            response.setBankTransactionNumber(
                    payment.getBankTransaction().getTransactionNumber()
            );
        }

        return response;
    }


    // =========================================================
    // NUMBER GENERATORS
    // =========================================================

    private String generatePaymentNumber() {

        return "PAY-" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12)
                .toUpperCase();
    }


    private String generateTransactionNumber() {

        return "BT-" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12)
                .toUpperCase();
    }


    // =========================================================
    // HELPERS
    // =========================================================

    private BigDecimal defaultZero(BigDecimal value) {
        return value == null ? ZERO : value;
    }
}
