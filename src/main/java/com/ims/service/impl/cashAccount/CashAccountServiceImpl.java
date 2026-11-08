package com.ims.service.impl.cashAccount;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.cashAccount.CashAccountRequestDTO;
import com.ims.dtos.cashAccount.CashAccountResponseDTO;
import com.ims.entity.CashAccountEntity;
import com.ims.enums.CashAccountStatus;
import com.ims.mapper.cashAccount.CashAccountMapper;
import com.ims.repository.CashAccountRepository;
import com.ims.service.serviceInterface.cashAccount.CashAccountService;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.specification.CashAccountSpecification;
import com.ims.utils.validation.CashAccountValidation;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class CashAccountServiceImpl implements CashAccountService {

    private final CashAccountRepository cashAccountRepository;
    private final CashAccountMapper cashAccountMapper;
    private final CashAccountValidation cashAccountValidation;
    private final BaseEntityUtil baseEntityUtil;

    @Override
    public ApiResponse<CashAccountResponseDTO> create(
            CashAccountRequestDTO request
    ) {

        cashAccountValidation.validateCreate(request);

        CashAccountEntity entity = cashAccountMapper.toEntity(request);

        entity.setAccountName(request.getAccountName().trim());

        entity.setAccountCode(generateCashAccountCode());

        entity.setCurrency(
                request.getCurrency().trim().toUpperCase(Locale.ROOT)
        );

        BigDecimal openingBalance = request.getOpeningBalance();

        entity.setOpeningBalance(openingBalance);
        entity.setCurrentBalance(openingBalance);

        // Status-based account management
        entity.setStatus(CashAccountStatus.ACTIVE.name());

        // Retain for compatibility with existing active-based code.
        entity.setActive(true);

        baseEntityUtil.prepareForCreate(entity);

        CashAccountEntity saved = cashAccountRepository.save(entity);

        return ApiResponse.success(
                cashAccountMapper.toResponse(saved),
                "Cash account created successfully."
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CashAccountResponseDTO> getById(Long id) {

        CashAccountEntity entity = cashAccountRepository
                .findByIdAndStatusNot(id, CashAccountStatus.DELETED.name())
                .filter(account ->
                        CashAccountStatus.ACTIVE.name().equalsIgnoreCase(
                                account.getStatus()
                        )
                )
                .orElseThrow(() ->
                        new IllegalArgumentException("Active cash account not found.")
                );

        return ApiResponse.success(
                cashAccountMapper.toResponse(entity),
                "Cash account fetched successfully."
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<CashAccountResponseDTO>> getAll(
            String search,
            String status,
            Pageable pageable
    ) {

        Specification<CashAccountEntity> specification =
                Specification
                        .where(CashAccountSpecification.search(search))
                        .and(CashAccountSpecification.hasStatus(
                                status == null || status.isBlank()
                                        || CashAccountStatus.ALL.name().equalsIgnoreCase(status.trim())
                                        ? CashAccountStatus.ACTIVE.name()
                                        : status
                        ));

        Page<CashAccountEntity> page =
                cashAccountRepository.findAll(specification, pageable);

        PageResponse<CashAccountResponseDTO> response =
                PageResponse.<CashAccountResponseDTO>builder()
                        .content(
                                page.getContent()
                                        .stream()
                                        .map(cashAccountMapper::toResponse)
                                        .toList()
                        )
                        .pageNumber(page.getNumber())
                        .pageSize(page.getSize())
                        .totalElements(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .last(page.isLast())
                        .build();

        return ApiResponse.success(
                response,
                "Cash accounts fetched successfully."
        );
    }

    @Override
    public ApiResponse<CashAccountResponseDTO> update(
            Long id,
            CashAccountRequestDTO request
    ) {

        CashAccountEntity entity =
                cashAccountValidation.validateAndGet(id);

        cashAccountValidation.validateUpdate(id, request);

        BigDecimal existingBalance = entity.getCurrentBalance();

        String existingStatus = entity.getStatus();

        cashAccountMapper.updateEntity(request, entity);

        entity.setAccountName(request.getAccountName().trim());

        entity.setAccountCode(
                request.getAccountCode().trim().toUpperCase(Locale.ROOT)
        );

        entity.setCurrency(
                request.getCurrency().trim().toUpperCase(Locale.ROOT)
        );

        // Do not allow normal update to delete an account.
        if (request.getStatus() != null) {

            if (CashAccountStatus.DELETED.name().equalsIgnoreCase(
                    request.getStatus()
            ) || CashAccountStatus.ALL.name().equalsIgnoreCase(
                    request.getStatus()
            )) {
                throw new IllegalArgumentException(
                        "Invalid cash account status."
                );
            }

            entity.setStatus(
                    request.getStatus().trim().toUpperCase(Locale.ROOT)
            );

        } else {
            entity.setStatus(existingStatus);
        }

        // Preserve the live balance.
        entity.setCurrentBalance(existingBalance);
        baseEntityUtil.prepareForUpdate(entity);

        CashAccountEntity saved = cashAccountRepository.save(entity);

        return ApiResponse.success(
                cashAccountMapper.toResponse(saved),
                "Cash account updated successfully."
        );
    }

    @Override
    public ApiResponse<Void> delete(Long id) {

        CashAccountEntity entity =
                cashAccountValidation.validateAndGet(id);

        // Status-based soft delete.
        entity.setStatus(CashAccountStatus.DELETED.name());

        // Retain compatibility with existing active-based references.
        entity.setActive(false);

        baseEntityUtil.prepareForUpdate(entity);

        cashAccountRepository.save(entity);

        return ApiResponse.success(
                null,
                "Cash account deleted successfully."
        );
    }

    private String generateCashAccountCode() {

        Integer lastSequence =
                cashAccountRepository.findMaxCashAccountSequence();

        int nextSequence =
                lastSequence == null ? 1 : lastSequence + 1;

        return String.format("CASH-%03d", nextSequence);
    }
}