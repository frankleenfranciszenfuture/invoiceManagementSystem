
package com.ims.service.impl.expenses;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;

import com.ims.dtos.expenses.ExpenseRequestDTO;
import com.ims.dtos.expenses.ExpenseResponseDTO;

import com.ims.entity.Currency;
import com.ims.entity.ExpenseCategoryEntity;
import com.ims.entity.ExpenseEntity;
import com.ims.entity.PartyEntity;
import com.ims.entity.TaxMasterEntity;

import com.ims.enums.*;

import com.ims.exception.BadRequestException;
import com.ims.exception.ResourceNotFoundException;

import com.ims.mapper.expenses.ExpenseMapper;

import com.ims.repository.CurrencyRepository;
import com.ims.repository.ExpenseCategoryRepository;
import com.ims.repository.ExpenseRepository;
import com.ims.repository.PartyRepository;
import com.ims.repository.TaxMasterRepository;

import com.ims.service.serviceInterface.currency.ExchangeRateService;
import com.ims.service.serviceInterface.expenses.ExpenseService;

import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.specification.ExpenseSpecification;
import com.ims.utils.validation.ExpenseValidation;

import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final ExpenseMapper expenseMapper;
    private final ExpenseValidation expenseValidation;

    private final CurrencyRepository currencyRepository;
    private final ExchangeRateService exchangeRateService;

    private final PartyRepository partyRepository;
    private final TaxMasterRepository taxMasterRepository;
    private final BaseEntityUtil baseEntityUtil;

    // =========================================================
    // CREATE EXPENSE
    // =========================================================

    @Override
    public ApiResponse<ExpenseResponseDTO> create(ExpenseRequestDTO dto) {

        expenseValidation.validateCreate(dto);

        ExpenseCategoryEntity category =
                getAndValidateCategory(dto.getExpenseCategoryId());

        validateExpenseType(dto.getExpenseType(), category);

        Currency currency = resolveCurrency(dto.getCurrencyId());

        ExpenseEntity expense = expenseMapper.toEntity(dto);

        expense.setExpenseNo(generateExpenseNo());
        expense.setExpenseCategory(category);
        expense.setCurrency(currency);

        if (dto.getVendorId() != null) {
            setVendor(expense, dto);
        }

        expense.setExpenseStatus(ExpenseStatus.DRAFT);
        expense.setPaymentStatus(ExpensePaymentStatus.UNPAID);

        calculateExpenseAmounts(expense, dto, currency);

        expense.setPaidAmount(BigDecimal.ZERO);
        expense.setDueAmount(expense.getTotalAmount());


        baseEntityUtil.prepareForCreate(expense);

        ExpenseEntity savedExpense = expenseRepository.save(expense);

        return ApiResponse.success(
                expenseMapper.toResponseDTO(savedExpense),
                "Expense created successfully"
        );
    }


    // =========================================================
    // UPDATE EXPENSE
    // =========================================================

    @Override
    public ApiResponse<ExpenseResponseDTO> update(
            Long id,
            ExpenseRequestDTO dto
    ) {

        expenseValidation.validateCreate(dto);

        ExpenseEntity expense = getExpense(id);

        expenseValidation.validateUpdate(expense);

        ExpenseCategoryEntity category =
                getAndValidateCategory(dto.getExpenseCategoryId());

        validateExpenseType(dto.getExpenseType(), category);

        Currency currency = resolveCurrency(dto.getCurrencyId());

        // Update normal DTO fields.
        expenseMapper.updateEntity(dto, expense);

        expense.setExpenseCategory(category);
        expense.setExpenseType(dto.getExpenseType());
        expense.setCurrency(currency);

        if (dto.getVendorId() != null) {
            setVendor(expense, dto);
        } else {
            expense.setVendor(null);
        }

        // Recalculate tax, currency and totals.
        calculateExpenseAmounts(expense, dto, currency);

        // Preserve existing payment information.
        BigDecimal paidAmount = zeroIfNull(expense.getPaidAmount());

        expense.setDueAmount(
                money(expense.getTotalAmount().subtract(paidAmount))
        );

        baseEntityUtil.prepareForUpdate(expense);

        ExpenseEntity updatedExpense = expenseRepository.save(expense);

        return ApiResponse.success(
                expenseMapper.toResponseDTO(updatedExpense),
                "Expense updated successfully"
        );
    }


    // =========================================================
    // GET EXPENSE BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ExpenseResponseDTO> getById(Long id) {

        ExpenseEntity expense = getExpense(id);

        return ApiResponse.success(
                expenseMapper.toResponseDTO(expense),
                "Expense fetched successfully"
        );
    }


    // =========================================================
    // GET ALL EXPENSES
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<ExpenseResponseDTO>> getAll(
            String search,
            ExpenseType expenseType,
            Long categoryId,
            ExpenseStatus expenseStatus,
            ExpensePaymentStatus paymentStatus,
            LocalDate fromDate,
            LocalDate toDate,
            String vendorName,
            Long currencyId,
            Long warehouseId,
            Pageable pageable
    ) {

        if (fromDate != null
                && toDate != null
                && fromDate.isAfter(toDate)) {

            throw new BadRequestException(
                    "From date cannot be after to date."
            );
        }

        Page<ExpenseEntity> expensePage =
                expenseRepository.findAll(
                        ExpenseSpecification.filter(
                                search,
                                expenseType,
                                categoryId,
                                expenseStatus,
                                paymentStatus,
                                fromDate,
                                toDate,
                                vendorName,
                                currencyId,
                                warehouseId
                        ),
                        pageable
                );

        PageResponse<ExpenseResponseDTO> pageResponse =
                PageResponse.<ExpenseResponseDTO>builder()
                        .content(
                                expensePage.getContent()
                                        .stream()
                                        .map(expenseMapper::toResponseDTO)
                                        .toList()
                        )
                        .pageNumber(expensePage.getNumber())
                        .pageSize(expensePage.getSize())
                        .totalElements(expensePage.getTotalElements())
                        .totalPages(expensePage.getTotalPages())
                        .last(expensePage.isLast())
                        .build();

        return ApiResponse.success(
                pageResponse,
                "Expenses fetched successfully"
        );
    }


    // =========================================================
    // APPROVE EXPENSE
    // =========================================================

    @Override
    public ApiResponse<ExpenseResponseDTO> approve(Long id) {

        ExpenseEntity expense = getExpense(id);

        expenseValidation.validateCanApprove(expense);

        expense.setExpenseStatus(ExpenseStatus.APPROVED);
        expense.setApprovedAt(LocalDateTime.now());

        // TODO: Set approvedBy using your CurrentUserService.

        ExpenseEntity approvedExpense = expenseRepository.save(expense);

        return ApiResponse.success(
                expenseMapper.toResponseDTO(approvedExpense),
                "Expense approved successfully"
        );
    }


    // =========================================================
    // REJECT EXPENSE
    // =========================================================

    @Override
    public ApiResponse<ExpenseResponseDTO> reject(
            Long id,
            String reason
    ) {

        if (reason == null || reason.isBlank()) {
            throw new BadRequestException(
                    "Rejection reason is required."
            );
        }

        ExpenseEntity expense = getExpense(id);

        expenseValidation.validateCanReject(expense);

        expense.setExpenseStatus(ExpenseStatus.REJECTED);
        expense.setRejectedAt(LocalDateTime.now());
        expense.setRejectionReason(reason.trim());

        // TODO: Set rejectedBy using your CurrentUserService.

        ExpenseEntity rejectedExpense = expenseRepository.save(expense);

        return ApiResponse.success(
                expenseMapper.toResponseDTO(rejectedExpense),
                "Expense rejected successfully"
        );
    }


    // =========================================================
    // CANCEL EXPENSE
    // =========================================================

    @Override
    public ApiResponse<ExpenseResponseDTO> cancel(Long id) {

        ExpenseEntity expense = getExpense(id);

        expenseValidation.validateCanCancel(expense);

        expense.setExpenseStatus(ExpenseStatus.CANCELLED);

        ExpenseEntity cancelledExpense = expenseRepository.save(expense);

        return ApiResponse.success(
                expenseMapper.toResponseDTO(cancelledExpense),
                "Expense cancelled successfully"
        );
    }


    // =========================================================
    // CALCULATE EXPENSE AMOUNTS
    // =========================================================

    private void calculateExpenseAmounts(
            ExpenseEntity expense,
            ExpenseRequestDTO dto,
            Currency currency
    ) {

        BigDecimal exchangeRate = resolveExchangeRate(
                currency,
                dto.getExpenseDate()
        );

        BigDecimal amount = money(dto.getAmount());

        BigDecimal discountAmount = money(dto.getDiscountAmount());

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException(
                    "Expense amount must be greater than zero."
            );
        }

        if (discountAmount.compareTo(amount) > 0) {
            throw new BadRequestException(
                    "Discount cannot be greater than expense amount."
            );
        }

        // Amount after discount.
        BigDecimal taxableAmount = money(
                amount.subtract(discountAmount)
        );

        // Resolve selected tax master.
        TaxMasterEntity taxMaster = resolveTaxMaster(dto.getTaxMasterId());

        BigDecimal cgstAmount = BigDecimal.ZERO;
        BigDecimal sgstAmount = BigDecimal.ZERO;
        BigDecimal igstAmount = BigDecimal.ZERO;

        if (taxMaster != null) {

            if (taxMaster.getTaxType() == TaxType.CGST_SGST) {

                cgstAmount = calculateTax(
                        taxableAmount,
                        taxMaster.getCgstRate()
                );

                sgstAmount = calculateTax(
                        taxableAmount,
                        taxMaster.getSgstRate()
                );

            } else if (taxMaster.getTaxType() == TaxType.IGST) {

                igstAmount = calculateTax(
                        taxableAmount,
                        taxMaster.getIgstRate()
                );

            } else {
                throw new BadRequestException(
                        "Unsupported tax type: " + taxMaster.getTaxType()
                );
            }
        }

        BigDecimal totalTaxAmount = money(
                cgstAmount
                        .add(sgstAmount)
                        .add(igstAmount)
        );

        BigDecimal totalAmount = money(
                taxableAmount.add(totalTaxAmount)
        );

        // -----------------------------------------------------
        // BASE INR CALCULATIONS
        // -----------------------------------------------------

        BigDecimal baseAmount = convertToBase(amount, exchangeRate);

        BigDecimal baseDiscountAmount =
                convertToBase(discountAmount, exchangeRate);

        BigDecimal baseTaxableAmount =
                convertToBase(taxableAmount, exchangeRate);

        BigDecimal baseCgstAmount =
                convertToBase(cgstAmount, exchangeRate);

        BigDecimal baseSgstAmount =
                convertToBase(sgstAmount, exchangeRate);

        BigDecimal baseIgstAmount =
                convertToBase(igstAmount, exchangeRate);

        BigDecimal baseTotalTaxAmount = money(
                baseCgstAmount
                        .add(baseSgstAmount)
                        .add(baseIgstAmount)
        );

        BigDecimal baseTotalAmount = money(
                baseTaxableAmount.add(baseTotalTaxAmount)
        );

        // -----------------------------------------------------
        // SET ENTITY RELATIONSHIPS
        // -----------------------------------------------------

        expense.setCurrency(currency);
        expense.setTaxMaster(taxMaster);
        expense.setExchangeRate(exchangeRate);

        // -----------------------------------------------------
        // SELECTED CURRENCY AMOUNTS
        // -----------------------------------------------------

        expense.setAmount(amount);
        expense.setDiscountAmount(discountAmount);
        expense.setTaxableAmount(taxableAmount);

        expense.setCgstAmount(cgstAmount);
        expense.setSgstAmount(sgstAmount);
        expense.setIgstAmount(igstAmount);

        expense.setTotalTaxAmount(totalTaxAmount);
        expense.setTotalAmount(totalAmount);

        // -----------------------------------------------------
        // BASE INR AMOUNTS
        // -----------------------------------------------------

        expense.setBaseAmount(baseAmount);
        expense.setBaseDiscountAmount(baseDiscountAmount);
        expense.setBaseTaxableAmount(baseTaxableAmount);

        expense.setBaseCgstAmount(baseCgstAmount);
        expense.setBaseSgstAmount(baseSgstAmount);
        expense.setBaseIgstAmount(baseIgstAmount);

        expense.setBaseTotalTaxAmount(baseTotalTaxAmount);
        expense.setBaseTotalAmount(baseTotalAmount);
    }


    // =========================================================
    // CALCULATE TAX
    // =========================================================

    private BigDecimal calculateTax(
            BigDecimal taxableAmount,
            BigDecimal taxRate
    ) {

        if (taxRate == null || taxRate.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException(
                    "Tax rate is missing or invalid in the selected tax master."
            );
        }

        return money(
                taxableAmount
                        .multiply(taxRate)
                        .divide(
                                BigDecimal.valueOf(100),
                                2,
                                RoundingMode.HALF_UP
                        )
        );
    }


    // =========================================================
    // RESOLVE TAX MASTER
    // =========================================================

    private TaxMasterEntity resolveTaxMaster(Long taxMasterId) {

        if (taxMasterId == null) {
            return null;
        }

        TaxMasterEntity taxMaster = taxMasterRepository
                .findByIdAndActiveTrue(taxMasterId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tax master not found or inactive with ID: "
                                        + taxMasterId
                        )
                );

        if (taxMaster.getTaxType() == null) {
            throw new BadRequestException(
                    "Tax type is not configured for the selected tax master."
            );
        }

        return taxMaster;
    }


    // =========================================================
    // CONVERT SELECTED CURRENCY TO BASE INR
    // =========================================================

    private BigDecimal convertToBase(
            BigDecimal amount,
            BigDecimal exchangeRate
    ) {

        return money(amount.multiply(exchangeRate));
    }


    // =========================================================
    // PRIVATE VALIDATION METHODS
    // =========================================================

    private ExpenseEntity getExpense(Long id) {

        return expenseRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() ->
                        new BadRequestException("Expense not found.")
                );
    }


    private ExpenseCategoryEntity getAndValidateCategory(Long categoryId) {

        return expenseCategoryRepository.findByIdAndActiveTrue(categoryId)
                .orElseThrow(() ->
                        new BadRequestException(
                                "Expense category not found or inactive."
                        )
                );
    }


    private void validateExpenseType(
            ExpenseType expenseType,
            ExpenseCategoryEntity category
    ) {

        if (expenseType == null) {
            throw new BadRequestException(
                    "Expense type is required."
            );
        }

        if (category.getExpenseType() != expenseType) {
            throw new BadRequestException(
                    "Expense type does not match the selected category."
            );
        }
    }


    // =========================================================
    // VENDOR VALIDATION
    // =========================================================

    private void setVendor(
            ExpenseEntity expense,
            ExpenseRequestDTO dto
    ) {

        PartyEntity party = partyRepository.findById(dto.getVendorId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Supplier not found with ID: "
                                        + dto.getVendorId()
                        )
                );

        if (party.getPartyType() != PartyType.BOTH) {
            throw new BadRequestException(
                    "Selected party must be a supplier."
            );
        }

        if (party.getStatus() != Status.ACTIVE) {
            throw new BadRequestException(
                    "Selected supplier is inactive."
            );
        }

        expense.setVendor(party);
    }


    // =========================================================
    // CURRENCY
    // =========================================================

    private Currency resolveCurrency(Long currencyId) {

        return currencyRepository.findById(currencyId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Currency not found with ID: " + currencyId
                        )
                );
    }


    private BigDecimal resolveExchangeRate(
            Currency currency,
            LocalDate expenseDate
    ) {

        Currency baseCurrency = currencyRepository
                .findByCurrencyCodeIgnoreCase("INR")
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Base currency INR not found"
                        )
                );

        if (currency.getId().equals(baseCurrency.getId())) {
            return BigDecimal.ONE;
        }

        BigDecimal rate = exchangeRateService
                .getRate(
                        currency.getId(),
                        baseCurrency.getId(),
                        expenseDate
                )
                .getData()
                .getRate();

        if (rate == null || rate.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException(
                    "Unable to retrieve a valid exchange rate."
            );
        }

        return rate;
    }


    // =========================================================
    // COMMON MONEY METHODS
    // =========================================================

    private BigDecimal money(BigDecimal value) {

        return zeroIfNull(value).setScale(
                2,
                RoundingMode.HALF_UP
        );
    }


    private BigDecimal zeroIfNull(BigDecimal value) {

        return value != null
                ? value
                : BigDecimal.ZERO;
    }


    // =========================================================
    // GENERATE EXPENSE NUMBER
    // =========================================================

    private String generateExpenseNo() {

        int currentYear = Year.now().getValue();

        Optional<ExpenseEntity> lastExpense =
                expenseRepository.findTopByOrderByIdDesc();

        int nextNumber = 1;

        if (lastExpense.isPresent()) {

            String lastExpenseNo =
                    lastExpense.get().getExpenseNo();

            if (lastExpenseNo != null &&
                    !lastExpenseNo.isBlank()) {

                String[] parts = lastExpenseNo.split("-");

                // EXP-2026-0001
                if (parts.length == 3) {

                    String yearPart = parts[1];

                    try {

                        if (Integer.parseInt(yearPart) == currentYear) {

                            nextNumber =
                                    Integer.parseInt(parts[2]) + 1;
                        }

                    } catch (NumberFormatException ex) {

                        log.warn(
                                "Unable to parse expense number: {}",
                                lastExpenseNo
                        );
                    }
                }
            }
        }

        return String.format(
                "EXP-%d-%04d",
                currentYear,
                nextNumber
        );
    }
}
