package com.ims.service.impl.cashAccount;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.cashAccount.CashAccountRequestDTO;
import com.ims.dtos.cashAccount.CashAccountResponseDTO;
import com.ims.entity.CashAccountEntity;
import com.ims.mapper.cashAccount.CashAccountMapper;
import com.ims.repository.CashAccountRepository;
import com.ims.service.serviceInterface.cashAccount.CashAccountService;
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

    @Override
    public ApiResponse<CashAccountResponseDTO> create(
            CashAccountRequestDTO request
    ) {

        cashAccountValidation.validateCreate(request);

        CashAccountEntity entity = cashAccountMapper.toEntity(request);

        entity.setAccountName(request.getAccountName().trim());
        entity.setAccountCode(request.getAccountCode().trim().toUpperCase(Locale.ROOT));
        entity.setCurrency(request.getCurrency().trim().toUpperCase(Locale.ROOT));

        BigDecimal openingBalance = request.getOpeningBalance();

        entity.setOpeningBalance(openingBalance);
        entity.setCurrentBalance(openingBalance);
        entity.setActive(true);

        CashAccountEntity saved = cashAccountRepository.save(entity);

        return ApiResponse.success(
                cashAccountMapper.toResponse(saved),
                "Cash account created successfully."
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CashAccountResponseDTO> getById(Long id) {

        CashAccountEntity entity =
                cashAccountValidation.validateAndGet(id);

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
                        .where(CashAccountSpecification.isActive())
                        .and(CashAccountSpecification.search(search))
                        .and(CashAccountSpecification.hasStatus(status));

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

        cashAccountMapper.updateEntity(request, entity);

        entity.setAccountName(request.getAccountName().trim());
        entity.setAccountCode(request.getAccountCode().trim().toUpperCase(Locale.ROOT));
        entity.setCurrency(request.getCurrency().trim().toUpperCase(Locale.ROOT));

        // Do not overwrite the live balance during account maintenance.
        entity.setCurrentBalance(existingBalance);

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

        // Soft delete. Keep the account and its transaction history.
        entity.setActive(false);
        entity.setStatus("INACTIVE");

        cashAccountRepository.save(entity);

        return ApiResponse.success(
                null,
                "Cash account deactivated successfully."
        );
    }
}