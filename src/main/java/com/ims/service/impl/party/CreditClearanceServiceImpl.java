
package com.ims.service.impl.party;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.common.audit.Auditable;
import com.ims.dtos.party.clearance.CreditClearanceRequest;
import com.ims.dtos.party.clearance.CreditClearanceResponse;
import com.ims.entity.CreditClearanceEntity;
import com.ims.entity.PartyEntity;
import com.ims.enums.PartyType;
import com.ims.enums.PaymentMethod;
import com.ims.enums.Status;
import com.ims.enums.audit.AuditAction;
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
public class CreditClearanceServiceImpl implements CreditClearanceService {

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
    @Auditable(
            action = AuditAction.CREATE,
            entity = "CREDIT_CLEARANCE",
            description = "Party credit clearance created"
    )
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

        PartyEntity party = partyValidation.validateParty(
                request.getPartyId()
        );

        validateParty(party);

        // 2. GET CURRENT OUTSTANDING

        BigDecimal outstanding = getPartyOutstanding(party);

        if (outstanding.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException(
                    "Party has no outstanding credit."
            );
        }

        // 3. VALIDATE CLEARANCE AMOUNT

        BigDecimal clearanceAmount = request.getClearanceAmount();

        if (clearanceAmount == null) {
            throw new ValidationException(
                    "Clearance amount is required."
            );
        }

        clearanceAmount = scaleAmount(clearanceAmount);

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

        // 4. VALIDATE PAYMENT METHOD

        validatePaymentMethod(request.getPaymentMethod());

        // 5. CALCULATE REMAINING OUTSTANDING

        BigDecimal creditLimit = scaleAmount(
                nullSafe(party.getCreditLimit())
        );

        BigDecimal remainingOutstanding = scaleAmount(
                outstanding.subtract(clearanceAmount)
        );

        // 6. GENERATE CLEARANCE NUMBER

        String clearanceNo = generateClearanceNumber();

        // 7. CREATE ENTITY

        CreditClearanceEntity entity = new CreditClearanceEntity();

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

        // 8. PREPARE AUDIT

        baseEntityUtil.prepareForCreate(entity);

        // 9. UPDATE PARTY OUTSTANDING

        setPartyOutstanding(party, remainingOutstanding);

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
    @Auditable(
            action = AuditAction.UPDATE,
            entity = "CREDIT_CLEARANCE",
            recordId = "#p0",
            description = "Party credit clearance updated"
    )
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
                creditClearanceValidation.validateCreditClearance(id);

        // 2. GET OLD PARTY

        PartyEntity oldParty = entity.getParty();

        if (oldParty == null) {
            throw new ValidationException(
                    "Existing clearance party information is missing."
            );
        }

        // 3. VALIDATE NEW PARTY

        PartyEntity newParty = partyValidation.validateParty(
                request.getPartyId()
        );

        validateParty(newParty);

        // 4. CHECK WHETHER PARTY IS CHANGED

        boolean sameParty = oldParty.getId().equals(newParty.getId());

        /*
         * When the party is unchanged, use the existing managed entity.
         * This ensures that restoring the old clearance and applying
         * the new clearance operate on the same outstanding balance.
         */

        if (sameParty) {
            newParty = oldParty;
        }

        // 5. RESTORE OLD CLEARANCE TO OLD PARTY

        BigDecimal oldPartyOutstanding = getPartyOutstanding(oldParty);

        BigDecimal oldClearanceAmount = scaleAmount(
                nullSafe(entity.getClearanceAmount())
        );

        BigDecimal restoredOldOutstanding = scaleAmount(
                oldPartyOutstanding.add(oldClearanceAmount)
        );

        setPartyOutstanding(oldParty, restoredOldOutstanding);

        baseEntityUtil.prepareForUpdate(oldParty);

        /*
         * If the party is unchanged, the restored amount is also
         * the outstanding amount available for the new clearance.
         *
         * If the party has changed, read the new party's own balance.
         */

        BigDecimal newPartyOutstanding = sameParty
                ? restoredOldOutstanding
                : getPartyOutstanding(newParty);

        // 6. VALIDATE NEW CLEARANCE AMOUNT

        BigDecimal newClearanceAmount = request.getClearanceAmount();

        if (newClearanceAmount == null) {
            throw new ValidationException(
                    "Clearance amount is required."
            );
        }

        newClearanceAmount = scaleAmount(newClearanceAmount);

        if (newClearanceAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException(
                    "Clearance amount must be greater than zero."
            );
        }

        if (newClearanceAmount.compareTo(newPartyOutstanding) > 0) {
            throw new ValidationException(
                    "Clearance amount cannot exceed outstanding credit of "
                            + newPartyOutstanding
            );
        }

        // 7. VALIDATE PAYMENT METHOD

        validatePaymentMethod(request.getPaymentMethod());

        // 8. CALCULATE NEW OUTSTANDING

        BigDecimal newOutstanding = scaleAmount(
                newPartyOutstanding.subtract(newClearanceAmount)
        );

        // 9. UPDATE NEW PARTY OUTSTANDING

        setPartyOutstanding(newParty, newOutstanding);

        baseEntityUtil.prepareForUpdate(newParty);

        // 10. UPDATE CLEARANCE ENTITY

        entity.setParty(newParty);
        entity.setPartyType(newParty.getPartyType());

        entity.setCreditLimit(
                scaleAmount(nullSafe(newParty.getCreditLimit()))
        );

        entity.setClearanceAmount(newClearanceAmount);

        entity.setPreviousOutstandingCredit(
                newPartyOutstanding
        );

        entity.setRemainingOutstandingCredit(
                newOutstanding
        );

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

        // 11. SAVE PARTIES

        partyRepository.save(oldParty);

        if (!sameParty) {
            partyRepository.save(newParty);
        }

        // 12. SAVE CLEARANCE

        CreditClearanceEntity updated =
                creditClearanceRepository.save(entity);

        log.info(
                "Credit clearance updated -> clearanceNo={}, "
                        + "oldPartyId={}, newPartyId={}, amount={}, remaining={}",
                updated.getClearanceNo(),
                oldParty.getId(),
                newParty.getId(),
                newClearanceAmount,
                newOutstanding
        );

        // 13. RESPONSE

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
    public ApiResponse<CreditClearanceResponse> getById(Long id) {

        CreditClearanceEntity clearance =
                creditClearanceValidation.validateCreditClearance(id);

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

        PartyEntity party = partyValidation.validateParty(partyId);

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

        Pageable pageable = PageRequest.of(
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
    public ApiResponse<PageResponse<CreditClearanceResponse>> getByPartyPaged(
            Long partyId,
            int page,
            int size) {

        validatePagination(page, size);

        PartyEntity party = partyValidation.validateParty(partyId);

        Pageable pageable = PageRequest.of(
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
    public ApiResponse<List<CreditClearanceResponse>> getByDateRange(
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
    // DELETE / REVERSE CREDIT CLEARANCE
    // =====================================================

    @Override
    @Auditable(
            action = AuditAction.DELETE,
            entity = "CREDIT_CLEARANCE",
            recordId = "#p0",
            description = "Party credit clearance deleted"
    )
    public ApiResponse<Void> delete(Long id) {

        // 1. VALIDATE CLEARANCE

        CreditClearanceEntity entity =
                creditClearanceValidation.validateCreditClearance(id);

        // 2. GET PARTY

        PartyEntity party = entity.getParty();

        if (party == null) {
            throw new ValidationException(
                    "Party information is missing."
            );
        }

        // 3. GET CURRENT OUTSTANDING

        BigDecimal currentOutstanding = getPartyOutstanding(party);

        BigDecimal clearanceAmount = scaleAmount(
                nullSafe(entity.getClearanceAmount())
        );

        // 4. RESTORE OUTSTANDING

        BigDecimal restoredOutstanding = scaleAmount(
                currentOutstanding.add(clearanceAmount)
        );

        /*
         * Do not reject a reversal merely because the restored
         * outstanding exceeds the current credit limit.
         *
         * Reversal must undo the original clearance transaction.
         */

        // 5. UPDATE PARTY

        setPartyOutstanding(party, restoredOutstanding);

        baseEntityUtil.prepareForUpdate(party);

        partyRepository.save(party);

        // 6. MARK CLEARANCE INACTIVE

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

        // 7. RESPONSE

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

        if (party == null) {
            throw new ValidationException(
                    "Party information is required."
            );
        }

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

    private void validatePaymentMethod(PaymentMethod paymentMethod) {

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
    // GET PARTY OUTSTANDING
    // =====================================================

    private BigDecimal getPartyOutstanding(PartyEntity party) {

        BigDecimal outstanding;

        if (PartyType.CUSTOMER.equals(party.getPartyType())) {

            // Customer: amount receivable from customer
            outstanding = party.getOutstandingReceivable();

        } else if (PartyType.SUPPLIER.equals(party.getPartyType())) {

            // Supplier: amount payable to supplier
            outstanding = party.getOutstandingPayable();

        } else {

            throw new ValidationException(
                    "Credit clearance is supported only "
                            + "for customers and suppliers."
            );
        }

        return scaleAmount(nullSafe(outstanding));
    }

    // =====================================================
    // UPDATE PARTY OUTSTANDING
    // =====================================================

    private void setPartyOutstanding(
            PartyEntity party,
            BigDecimal outstanding) {

        BigDecimal amount = scaleAmount(nullSafe(outstanding));

        if (PartyType.CUSTOMER.equals(party.getPartyType())) {

            party.setOutstandingReceivable(amount);

        } else if (PartyType.SUPPLIER.equals(party.getPartyType())) {

            party.setOutstandingPayable(amount);

        } else {

            throw new ValidationException(
                    "Credit clearance is supported only "
                            + "for customers and suppliers."
            );
        }
    }

    // =====================================================
    // GENERATE GLOBAL CLEARANCE NUMBER
    // =====================================================

    private String generateClearanceNumber() {

        String prefix = "CC-" + LocalDate.now().getYear() + "-";

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
    // AMOUNT SCALE
    // =====================================================

    private BigDecimal scaleAmount(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP);
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
