package com.ims.service.impl.currency;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.common.audit.Auditable;
import com.ims.dtos.currency.CurrencyRequestDTO;
import com.ims.dtos.currency.CurrencyResponseDTO;
import com.ims.entity.Currency;
import com.ims.enums.CurrencyStatus;
import com.ims.enums.audit.AuditAction;
import com.ims.exception.ResourceNotFoundException;
import com.ims.exception.ValidationException;
import com.ims.repository.CurrencyRepository;
import com.ims.service.serviceInterface.currency.CurrencyService;
import com.ims.utils.specification.CurrencySpecification;
import com.ims.utils.validation.CurrencyValidation;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CurrencyServiceImpl implements CurrencyService {

    private final CurrencyRepository currencyRepository;
    private final CurrencyValidation validation;

    @Override
    @Auditable(
            action = AuditAction.CREATE,
            entity = "CURRENCY",
            description = "Currency created"
    )
    public ApiResponse<CurrencyResponseDTO> create(
            CurrencyRequestDTO dto) {

        String code = validation.normalizeCode(dto.getCurrencyCode());

        // Check whether this currency was previously deleted
        Currency existingCurrency = currencyRepository
                .findByCurrencyCodeIgnoreCase(code)
                .orElse(null);

        if (existingCurrency != null) {

            // Reactivate previously deleted currency
            if (existingCurrency.getStatus() == CurrencyStatus.DELETED) {

                existingCurrency.setCurrencyName(dto.getCurrencyName().trim());
                existingCurrency.setSymbol(dto.getSymbol().trim());
                existingCurrency.setDecimalPlaces(dto.getDecimalPlaces());
                existingCurrency.setStatus(
                        dto.getStatus() != null
                                ? dto.getStatus()
                                : CurrencyStatus.ACTIVE
                );
                existingCurrency.setActive(
                        dto.getActive() == null || dto.getActive()
                );

                Currency restored = currencyRepository.save(existingCurrency);

                return ApiResponse.success(
                        toResponse(restored),
                        "Previously deleted currency reactivated successfully"
                );
            }

            // Currency already exists
            throw new IllegalArgumentException(
                    "Currency code already exists: " + code
            );
        }

        // Normal creation
        Currency currency = Currency.builder()
                .currencyCode(code)
                .currencyName(dto.getCurrencyName().trim())
                .symbol(dto.getSymbol().trim())
                .decimalPlaces(dto.getDecimalPlaces())
                .status(
                        dto.getStatus() != null
                                ? dto.getStatus()
                                : CurrencyStatus.ACTIVE
                )
                .active(dto.getActive() == null || dto.getActive())
                .build();

        Currency saved = currencyRepository.save(currency);

        return ApiResponse.success(
                toResponse(saved),
                "Currency created successfully"
        );
    }

    @Override
    @Auditable(
            action = AuditAction.UPDATE,
            entity = "CURRENCY",
            recordId = "#p0",
            description = "Currency updated"
    )
    public ApiResponse<CurrencyResponseDTO> update(
            Long id,
            CurrencyRequestDTO dto) {

        Currency currency = validation.validateExists(id);

        String code = validation.normalizeCode(dto.getCurrencyCode());

        validation.validateUniqueCode(code, id);

        currency.setCurrencyCode(code);
        currency.setCurrencyName(dto.getCurrencyName().trim());
        currency.setSymbol(dto.getSymbol().trim());
        currency.setDecimalPlaces(dto.getDecimalPlaces());
        currency.setStatus(dto.getStatus());
        if (dto.getActive() != null) {
            currency.setActive(dto.getActive());
        }

        Currency updated = currencyRepository.save(currency);

        return ApiResponse.success(
                toResponse(updated),
                "Currency updated successfully"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CurrencyResponseDTO> getById(Long id) {

        Currency currency = validation.validateExists(id);

        return ApiResponse.success(
                toResponse(currency),
                "Currency fetched successfully"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<CurrencyResponseDTO>> getAll(
            String search,
            Boolean active,
            Pageable pageable) {

        Specification<Currency> spec =
                CurrencySpecification.filter(search, active)
                        .and(CurrencySpecification.isNotDeleted());

        Page<Currency> page =
                currencyRepository.findAll(spec, pageable);

        PageResponse<CurrencyResponseDTO> pageResponse =
                toPageResponse(page);

        return ApiResponse.success(
                pageResponse,
                "Currencies fetched successfully"
        );
    }

    @Override
    @Auditable(
            action = AuditAction.DELETE,
            entity = "CURRENCY",
            recordId = "#p0",
            description = "Currency deleted"
    )
    public ApiResponse<Void> delete(Long id) {

        Currency currency = validation.validateExists(id);

        if (currency.getStatus() == CurrencyStatus.DELETED) {
            throw new ValidationException(
                    "Currency is already deleted."
            );
        }

        currency.setStatus(CurrencyStatus.DELETED);
        currency.setActive(false);

        currencyRepository.save(currency);

        return ApiResponse.success(
                null,
                "Currency deleted successfully."
        );
    }

    @Override
    public ApiResponse<Void> restoreCurrency(Long id) {

        Currency currency = currencyRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Currency not found."
                        )
                );

        if (currency.getStatus() != CurrencyStatus.DELETED) {
            throw new ValidationException(
                    "Only deleted currencies can be restored."
            );
        }

        currency.setStatus(CurrencyStatus.ACTIVE);
        currency.setActive(true);

        currencyRepository.save(currency);

        return ApiResponse.success(
                null,
                "Currency restored successfully."
        );
    }

    private CurrencyResponseDTO toResponse(Currency currency) {

        return CurrencyResponseDTO.builder()
                .id(currency.getId())
                .currencyCode(currency.getCurrencyCode())
                .currencyName(currency.getCurrencyName())
                .symbol(currency.getSymbol())
                .decimalPlaces(currency.getDecimalPlaces())
                .status(currency.getStatus())
                .active(currency.getActive())
                .build();
    }

    private PageResponse<CurrencyResponseDTO> toPageResponse(
            Page<Currency> page) {

        return PageResponse.<CurrencyResponseDTO>builder()
                .content(
                        page.getContent()
                                .stream()
                                .map(this::toResponse)
                                .toList()
                )
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}