package com.ims.service.impl.party;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.party.clearance.CreditClearanceRequest;
import com.ims.dtos.party.clearance.CreditClearanceResponse;
import com.ims.entity.CreditClearanceEntity;
import com.ims.entity.PartyEntity;
import com.ims.enums.PartyType;
import com.ims.enums.PaymentMethod;
import com.ims.enums.Status;
import com.ims.exception.ValidationException;
import com.ims.mapper.party.CreditClearanceMapper;
import com.ims.repository.CreditClearanceRepository;
import com.ims.repository.PartyRepository;
import com.ims.service.serviceInterface.party.CreditClearanceService;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.validation.CreditClearanceValidation;
import com.ims.utils.validation.PartyValidation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CreditClearanceServiceImpl
        implements CreditClearanceService {

    private final CreditClearanceRepository creditClearanceRepository;
    private final PartyRepository partyRepository;
    private final CreditClearanceMapper creditClearanceMapper;
    private final BaseEntityUtil baseEntityUtil;
    private final CreditClearanceValidation creditClearanceValidation;
    private final PartyValidation partyValidation;

    // =====================================================
    // CREATE CREDIT CLEARANCE
    // =====================================================

    @Override
    public ApiResponse<CreditClearanceResponse> create(
            CreditClearanceRequest request) {

        if (request == null) {
            throw new ValidationException(
                    "Credit clearance request is required."
            );
        }

        log.info(
                "Creating credit clearance -> partyId={}",
                request.getPartyId()
        );

        // 1. VALIDATE PARTY

        PartyEntity party =
                partyValidation.validateParty(
                        request.getPartyId()
                );

        validateParty(party);

        // 2. CURRENT OUTSTANDING CREDIT

        BigDecimal outstanding =
                nullSafe(party.getOutstandingCredit())
                        .setScale(2, RoundingMode.HALF_UP);

        if (outstanding.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException(
                    "Party has no outstanding credit."
            );
        }

        // 3. CLEARANCE AMOUNT

        BigDecimal clearanceAmount =
                request.getClearanceAmount();

        if (clearanceAmount == null) {
            throw new ValidationException(
                    "Clearance amount is required."
            );
        }

        clearanceAmount =
                clearanceAmount.setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        if (clearanceAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException(
                    "Clearance amount must be greater than zero."
            );
        }

        if (clearanceAmount.compareTo(outstanding) > 0) {
            throw new ValidationException(
                    "Clearance amount cannot exceed outstanding credit of "
                            + outstanding
            );
        }

        // 4. PAYMENT METHOD

        validatePaymentMethod(request.getPaymentMethod());

        // 5. CALCULATE REMAINING OUTSTANDING

        BigDecimal creditLimit =
                nullSafe(party.getCreditLimit())
                        .setScale(2, RoundingMode.HALF_UP);

        BigDecimal remainingOutstanding =
                outstanding.subtract(clearanceAmount)
                        .setScale(2, RoundingMode.HALF_UP);

        // 6. GENERATE CLEARANCE NUMBER

        String clearanceNo = generateClearanceNumber();

        // 7. CREATE ENTITY

        CreditClearanceEntity entity =
                new CreditClearanceEntity();

        entity.setClearanceNo(clearanceNo);
        entity.setParty(party);
        entity.setPartyType(party.getPartyType());
        entity.setCreditLimit(creditLimit);
        entity.setClearanceAmount(clearanceAmount);
        entity.setPreviousOutstandingCredit(outstanding);
        entity.setRemainingOutstandingCredit(remainingOutstanding);
        entity.setPaymentMethod(request.getPaymentMethod());

        entity.setPaymentReferenceNumber(
                emptyToNull(request.getPaymentReferenceNumber())
        );

        entity.setClearanceDate(request.getClearanceDate());

        entity.setRemarks(
                emptyToNull(request.getRemarks())
        );

        entity.setStatus(Status.ACTIVE);

        // 8. AUDIT

        baseEntityUtil.prepareForCreate(entity);

        // 9. UPDATE PARTY

        party.setOutstandingCredit(remainingOutstanding);
        baseEntityUtil.prepareForUpdate(party);

        // 10. SAVE

        partyRepository.save(party);

        CreditClearanceEntity saved =
                creditClearanceRepository.save(entity);

        log.info(
                "Credit clearance created -> clearanceNo={}, partyId={}, "
                        + "amount={}, remainingOutstanding={}",
                saved.getClearanceNo(),
                party.getId(),
                clearanceAmount,
                remainingOutstanding
        );

        // 11. RESPONSE

        return ApiResponse
                .<CreditClearanceResponse>builder()
                .success(true)
                .message("Credit clearance created successfully.")
                .data(creditClearanceMapper.toResponse(saved))
                .build();
    }

    // =====================================================
    // UPDATE CREDIT CLEARANCE
    // =====================================================

    @Override
    public ApiResponse<CreditClearanceResponse> update(
            Long id,
            CreditClearanceRequest request) {

        if (request == null) {
            throw new ValidationException(
                    "Credit clearance request is required."
            );
        }

        // 1. VALIDATE EXISTING CLEARANCE

        CreditClearanceEntity entity =
                creditClearanceValidation
                        .validateCreditClearance(id);

        // 2. VALIDATE PARTY

        PartyEntity party =
                partyValidation.validateParty(
                        request.getPartyId()
                );

        validateParty(party);

        // 3. OLD CLEARANCE AMOUNT

        BigDecimal oldClearanceAmount =
                nullSafe(entity.getClearanceAmount());

        // 4. CURRENT PARTY OUTSTANDING

        BigDecimal currentOutstanding =
                nullSafe(party.getOutstandingCredit());

        // 5. RESTORE OLD CLEARANCE

        BigDecimal outstandingAfterReversal =
                currentOutstanding.add(oldClearanceAmount)
                        .setScale(2, RoundingMode.HALF_UP);

        // 6. VALIDATE NEW CLEARANCE AMOUNT

        BigDecimal newClearanceAmount =
                request.getClearanceAmount();

        if (newClearanceAmount == null) {
            throw new ValidationException(
                    "Clearance amount is required."
            );
        }

        newClearanceAmount =
                newClearanceAmount.setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        if (newClearanceAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException(
                    "Clearance amount must be greater than zero."
            );
        }

        if (newClearanceAmount.compareTo(
                outstandingAfterReversal
        ) > 0) {
            throw new ValidationException(
                    "Clearance amount cannot exceed outstanding credit."
            );
        }

        // 7. PAYMENT METHOD

        validatePaymentMethod(request.getPaymentMethod());

        // 8. CALCULATE NEW OUTSTANDING

        BigDecimal newOutstanding =
                outstandingAfterReversal
                        .subtract(newClearanceAmount)
                        .setScale(2, RoundingMode.HALF_UP);

        // 9. UPDATE PARTY

        party.setOutstandingCredit(newOutstanding);
        baseEntityUtil.prepareForUpdate(party);

        // 10. UPDATE CLEARANCE

        entity.setParty(party);
        entity.setPartyType(party.getPartyType());

        entity.setCreditLimit(
                nullSafe(party.getCreditLimit())
        );

        entity.setClearanceAmount(newClearanceAmount);

        entity.setPreviousOutstandingCredit(
                outstandingAfterReversal
        );

        entity.setRemainingOutstandingCredit(newOutstanding);
        entity.setPaymentMethod(request.getPaymentMethod());

        entity.setPaymentReferenceNumber(
                emptyToNull(request.getPaymentReferenceNumber())
        );

        entity.setClearanceDate(request.getClearanceDate());

        entity.setRemarks(
                emptyToNull(request.getRemarks())
        );

        entity.setStatus(Status.ACTIVE);

        baseEntityUtil.prepareForUpdate(entity);

        // 11. SAVE

        partyRepository.save(party);

        CreditClearanceEntity updated =
                creditClearanceRepository.save(entity);

        return ApiResponse
                .<CreditClearanceResponse>builder()
                .success(true)
                .message("Credit clearance updated successfully.")
                .data(creditClearanceMapper.toResponse(updated))
                .build();
    }

    // =====================================================
    // GET BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CreditClearanceResponse> getById(
            Long id) {

        CreditClearanceEntity clearance =
                creditClearanceValidation
                        .validateCreditClearance(id);

        return ApiResponse
                .<CreditClearanceResponse>builder()
                .success(true)
                .message("Credit clearance fetched successfully.")
                .data(creditClearanceMapper.toResponse(clearance))
                .build();
    }

    // =====================================================
    // GET BY PARTY
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<CreditClearanceResponse>> getByParty(
            Long partyId) {

        PartyEntity party =
                partyValidation.validateParty(partyId);

        List<CreditClearanceResponse> response =
                creditClearanceRepository
                        .findByPartyIdAndStatusOrderByClearanceDateDesc(
                                party.getId(),
                                Status.ACTIVE
                        )
                        .stream()
                        .map(creditClearanceMapper::toResponse)
                        .toList();

        return ApiResponse
                .<List<CreditClearanceResponse>>builder()
                .success(true)
                .message("Party credit clearances fetched successfully.")
                .data(response)
                .build();
    }

    // =====================================================
    // GET ALL
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<CreditClearanceResponse>> getAll(
            int page,
            int size) {

        validatePagination(page, size);

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.DESC,
                                "clearanceDate"
                        )
                );

        Page<CreditClearanceEntity> clearances =
                creditClearanceRepository.findByStatus(
                        Status.ACTIVE,
                        pageable
                );

        return ApiResponse
                .<PageResponse<CreditClearanceResponse>>builder()
                .success(true)
                .message("Credit clearances fetched successfully.")
                .data(toPageResponse(clearances))
                .build();
    }

    // =====================================================
    // GET BY PARTY - PAGED
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<CreditClearanceResponse>>
    getByPartyPaged(
            Long partyId,
            int page,
            int size) {

        validatePagination(page, size);

        PartyEntity party =
                partyValidation.validateParty(partyId);

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.DESC,
                                "clearanceDate"
                        )
                );

        Page<CreditClearanceEntity> clearances =
                creditClearanceRepository.findByPartyIdAndStatus(
                        party.getId(),
                        Status.ACTIVE,
                        pageable
                );

        return ApiResponse
                .<PageResponse<CreditClearanceResponse>>builder()
                .success(true)
                .message("Party credit clearances fetched successfully.")
                .data(toPageResponse(clearances))
                .build();
    }

    // =====================================================
    // GET BY DATE RANGE
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<CreditClearanceResponse>>
    getByDateRange(
            LocalDate fromDate,
            LocalDate toDate) {

        if (fromDate == null) {
            throw new ValidationException(
                    "From date is required."
            );
        }

        if (toDate == null) {
            throw new ValidationException(
                    "To date is required."
            );
        }

        if (fromDate.isAfter(toDate)) {
            throw new ValidationException(
                    "From date cannot be after to date."
            );
        }

        List<CreditClearanceResponse> response =
                creditClearanceRepository
                        .findByStatusAndClearanceDateBetween(
                                Status.ACTIVE,
                                fromDate,
                                toDate
                        )
                        .stream()
                        .map(creditClearanceMapper::toResponse)
                        .toList();

        return ApiResponse
                .<List<CreditClearanceResponse>>builder()
                .success(true)
                .message("Credit clearances fetched successfully.")
                .data(response)
                .build();
    }

    // =====================================================
    // DELETE / REVERSE
    // =====================================================

    @Override
    public ApiResponse<Void> delete(Long id) {

        // 1. VALIDATE CLEARANCE

        CreditClearanceEntity entity =
                creditClearanceValidation
                        .validateCreditClearance(id);

        // 2. GET PARTY

        PartyEntity party = entity.getParty();

        if (party == null) {
            throw new ValidationException(
                    "Party information is missing."
            );
        }

        // 3. CURRENT OUTSTANDING

        BigDecimal currentOutstanding =
                nullSafe(party.getOutstandingCredit());

        BigDecimal clearanceAmount =
                nullSafe(entity.getClearanceAmount());

        // 4. RESTORE OUTSTANDING

        BigDecimal restoredOutstanding =
                currentOutstanding.add(clearanceAmount)
                        .setScale(2, RoundingMode.HALF_UP);

        // 5. VALIDATE CREDIT LIMIT

        BigDecimal creditLimit =
                nullSafe(party.getCreditLimit());

        if (restoredOutstanding.compareTo(creditLimit) > 0) {
            throw new ValidationException(
                    "Cannot reverse clearance because restored "
                            + "outstanding credit exceeds credit limit."
            );
        }

        // 6. UPDATE PARTY

        party.setOutstandingCredit(restoredOutstanding);
        baseEntityUtil.prepareForUpdate(party);
        partyRepository.save(party);

        // 7. MARK CLEARANCE INACTIVE

        entity.setStatus(Status.INACTIVE);
        entity.setActive(false);

        baseEntityUtil.prepareForUpdate(entity);
        creditClearanceRepository.save(entity);

        log.info(
                "Credit clearance reversed -> clearanceNo={}, "
                        + "partyId={}, amount={}, before={}, after={}",
                entity.getClearanceNo(),
                party.getId(),
                clearanceAmount,
                currentOutstanding,
                restoredOutstanding
        );

        return ApiResponse
                .<Void>builder()
                .success(true)
                .message("Credit clearance reversed successfully.")
                .build();
    }

    // =====================================================
    // VALIDATE PARTY
    // =====================================================

    private void validateParty(PartyEntity party) {

        if (!Boolean.TRUE.equals(party.getActive())) {
            throw new ValidationException(
                    "Cannot clear credit for an inactive party."
            );
        }

        if (party.getPartyType() == null) {
            throw new ValidationException(
                    "Party type is required."
            );
        }

        if (!PartyType.SUPPLIER.equals(party.getPartyType())
                && !PartyType.CUSTOMER.equals(party.getPartyType())) {
            throw new ValidationException(
                    "Credit clearance is supported only "
                            + "for customers and suppliers."
            );
        }
    }

    // =====================================================
    // PAYMENT METHOD VALIDATION
    // =====================================================

    private void validatePaymentMethod(
            PaymentMethod paymentMethod) {

        if (paymentMethod == null) {
            throw new ValidationException(
                    "Payment method is required."
            );
        }

        if (PaymentMethod.CREDIT.equals(paymentMethod)) {
            throw new ValidationException(
                    "CREDIT payment method is not allowed "
                            + "for credit clearance."
            );
        }
    }

    // =====================================================
    // GENERATE GLOBAL CLEARANCE NUMBER
    // =====================================================

    private String generateClearanceNumber() {

        String prefix =
                "CC-" + LocalDate.now().getYear() + "-";

        Optional<CreditClearanceEntity> latest =
                creditClearanceRepository
                        .findTopByClearanceNoStartingWithOrderByIdDesc(
                                prefix
                        );

        int nextNumber = 1;

        if (latest.isPresent()) {

            String lastClearanceNo =
                    latest.get().getClearanceNo();

            String sequence =
                    lastClearanceNo.substring(prefix.length());

            try {
                nextNumber = Integer.parseInt(sequence) + 1;
            } catch (NumberFormatException exception) {
                throw new ValidationException(
                        "Unable to generate the next credit clearance number."
                );
            }
        }

        return prefix + String.format("%06d", nextNumber);
    }

    // =====================================================
    // PAGE RESPONSE
    // =====================================================

    private PageResponse<CreditClearanceResponse> toPageResponse(
            Page<CreditClearanceEntity> page) {

        return PageResponse
                .<CreditClearanceResponse>builder()
                .content(
                        page.getContent()
                                .stream()
                                .map(creditClearanceMapper::toResponse)
                                .toList()
                )
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    // =====================================================
    // PAGINATION VALIDATION
    // =====================================================

    private void validatePagination(int page, int size) {

        if (page < 0) {
            throw new ValidationException(
                    "Page number cannot be negative."
            );
        }

        if (size <= 0) {
            throw new ValidationException(
                    "Page size must be greater than zero."
            );
        }

        if (size > 100) {
            throw new ValidationException(
                    "Page size cannot exceed 100."
            );
        }
    }

    // =====================================================
    // NULL SAFE
    // =====================================================

    private BigDecimal nullSafe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    // =====================================================
    // EMPTY STRING -> NULL
    // =====================================================

    private String emptyToNull(String value) {
        return value == null || value.isBlank()
                ? null
                : value.trim();
    }
}