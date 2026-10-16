package com.ims.service.impl.currency;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.exchange.ExchangeRateRequestDTO;
import com.ims.dtos.exchange.ExchangeRateResponseDTO;
import com.ims.entity.Currency;
import com.ims.entity.ExchangeRate;
import com.ims.repository.CurrencyRepository;
import com.ims.repository.ExchangeRateRepository;
import com.ims.service.serviceInterface.currency.ExchangeRateService;
import com.ims.utils.specification.ExchangeRateSpecification;
import com.ims.utils.validation.ExchangeRateValidation;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ExchangeRateServiceImpl implements ExchangeRateService {

    private final ExchangeRateRepository exchangeRateRepository;
    private final ExchangeRateValidation validation;
    private final RestTemplate restTemplate;
    private final CurrencyRepository currencyRepository;
    @Override
    public ApiResponse<ExchangeRateResponseDTO> create(
            ExchangeRateRequestDTO dto) {

        Currency from = validation.validateCurrency(
                dto.getFromCurrencyCode()
        );

        Currency to = validation.validateCurrency(
                dto.getToCurrencyCode()
        );

        validation.validateCurrencyPair(from, to);
        validation.validateRate(dto.getRate());

        if (dto.getEffectiveDate() == null) {
            throw new IllegalArgumentException(
                    "Effective date is required"
            );
        }

        validation.validateUniqueRate(
                from.getId(),
                to.getId(),
                dto.getEffectiveDate(),
                null
        );

        ExchangeRate rate = ExchangeRate.builder()
                .fromCurrency(from)
                .toCurrency(to)
                .rate(dto.getRate())
                .effectiveDate(dto.getEffectiveDate())
                .active(dto.getActive() == null || dto.getActive())
                .build();

        ExchangeRate saved = exchangeRateRepository.save(rate);

        return ApiResponse.success(
                toResponse(saved),
                "Exchange rate created successfully"
        );
    }

    @Override
    public ApiResponse<ExchangeRateResponseDTO> update(
            Long id,
            ExchangeRateRequestDTO dto) {

        ExchangeRate rate = validation.validateExists(id);

        Currency from = validation.validateCurrency(
                dto.getFromCurrencyCode()
        );

        Currency to = validation.validateCurrency(
                dto.getToCurrencyCode()
        );

        validation.validateCurrencyPair(from, to);
        validation.validateRate(dto.getRate());

        if (dto.getEffectiveDate() == null) {
            throw new IllegalArgumentException(
                    "Effective date is required"
            );
        }

        validation.validateUniqueRate(
                from.getId(),
                to.getId(),
                dto.getEffectiveDate(),
                id
        );

        rate.setFromCurrency(from);
        rate.setToCurrency(to);
        rate.setRate(dto.getRate());
        rate.setEffectiveDate(dto.getEffectiveDate());

        if (dto.getActive() != null) {
            rate.setActive(dto.getActive());
        }

        ExchangeRate updated = exchangeRateRepository.save(rate);

        return ApiResponse.success(
                toResponse(updated),
                "Exchange rate updated successfully"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ExchangeRateResponseDTO> getById(Long id) {

        ExchangeRate rate = validation.validateExists(id);

        return ApiResponse.success(
                toResponse(rate),
                "Exchange rate fetched successfully"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<ExchangeRateResponseDTO>> getAll(
            String fromCurrencyCode,
            String toCurrencyCode,
            LocalDate fromDate,
            LocalDate toDate,
            Boolean active,
            Pageable pageable) {

        if (fromDate != null && toDate != null
                && fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException(
                    "Start date cannot be after end date"
            );
        }

        Specification<ExchangeRate> spec =
                ExchangeRateSpecification.filter(
                        fromCurrencyCode,
                        toCurrencyCode,
                        fromDate,
                        toDate,
                        active
                );

        Page<ExchangeRate> page =
                exchangeRateRepository.findAll(spec, pageable);

        PageResponse<ExchangeRateResponseDTO> pageResponse =
                toPageResponse(page);

        return ApiResponse.success(
                pageResponse,
                "Exchange rates fetched successfully"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ExchangeRateResponseDTO> getRate(
            Long fromCurrencyId,
            Long toCurrencyId,
            LocalDate date) {

        // 1. Validate currency IDs
        if (fromCurrencyId == null || toCurrencyId == null) {
            throw new IllegalArgumentException(
                    "Both source and target currency IDs are required"
            );
        }

        // 2. Fetch source currency
        Currency fromCurrency = currencyRepository
                .findById(fromCurrencyId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Source currency not found"
                        )
                );

        // 3. Fetch target currency
        Currency toCurrency = currencyRepository
                .findById(toCurrencyId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Target currency not found"
                        )
                );

        // 4. Validate active currencies
        if (!Boolean.TRUE.equals(fromCurrency.getActive())
                || !Boolean.TRUE.equals(toCurrency.getActive())) {
            throw new IllegalArgumentException(
                    "Both currencies must be active"
            );
        }

        // 5. Normalize currency codes
        String from = fromCurrency.getCurrencyCode()
                .trim()
                .toUpperCase(Locale.ROOT);

        String to = toCurrency.getCurrencyCode()
                .trim()
                .toUpperCase(Locale.ROOT);

        // 6. Validate requested date
        LocalDate today = LocalDate.now();
        LocalDate requestedDate = date == null ? today : date;

        if (requestedDate.isAfter(today)) {
            throw new IllegalArgumentException(
                    "Future exchange rates are not available"
            );
        }

        // 7. Same-currency conversion
        if (from.equals(to)) {
            ExchangeRateResponseDTO dto =
                    ExchangeRateResponseDTO.builder()
                            .fromCurrencyCode(from)
                            .toCurrencyCode(to)
                            .rate(BigDecimal.ONE)
                            .effectiveDate(requestedDate)
                            .active(true)
                            .build();

            return ApiResponse.success(
                    dto,
                    "Exchange rate fetched successfully"
            );
        }

        // 8. External API currently supports today's rates only
        if (!requestedDate.equals(today)) {
            throw new IllegalArgumentException(
                    "Historical exchange rates are not supported by this API"
            );
        }

        String url = String.format(
                "https://open.er-api.com/v6/latest/%s",
                from
        );

        try {
            Map<String, Object> response = restTemplate.getForObject(
                    url,
                    Map.class
            );

            if (response == null
                    || !"success".equals(response.get("result"))
                    || !(response.get("rates") instanceof Map<?, ?> rates)) {
                throw new IllegalStateException(
                        "Invalid response from ExchangeRate-API"
                );
            }

            Object rateValue = rates.get(to);

            if (rateValue == null) {
                throw new IllegalArgumentException(
                        "Exchange rate not available for " + from + " to " + to
                );
            }

            BigDecimal exchangeRate =
                    new BigDecimal(rateValue.toString());

            LocalDate effectiveDate = requestedDate;

            Object lastUpdate = response.get("time_last_update_utc");

            if (lastUpdate != null) {
                try {
                    effectiveDate = ZonedDateTime.parse(
                            lastUpdate.toString(),
                            DateTimeFormatter.RFC_1123_DATE_TIME
                    ).withZoneSameInstant(ZoneOffset.UTC).toLocalDate();
                } catch (DateTimeParseException ignored) {
                    // Retain requested date if timestamp parsing fails.
                }
            }

            ExchangeRateResponseDTO dto =
                    ExchangeRateResponseDTO.builder()
                            .id(null)
                            .fromCurrencyId(fromCurrency.getId())
                            .fromCurrencyCode(from)
                            .fromCurrencyName(fromCurrency.getCurrencyName())
                            .toCurrencyId(toCurrency.getId())
                            .toCurrencyCode(to)
                            .toCurrencyName(toCurrency.getCurrencyName())
                            .rate(exchangeRate)
                            .effectiveDate(effectiveDate)
                            .active(true)
                            .build();

            return ApiResponse.success(
                    dto,
                    "Exchange rate fetched successfully"
            );

        } catch (RestClientException ex) {
            throw new IllegalStateException(
                    "Failed to fetch exchange rate from ExchangeRate-API",
                    ex
            );
        }
    }

    @Override
    public ApiResponse<Void> delete(Long id) {

        ExchangeRate rate = validation.validateExists(id);
        rate.setActive(false);
        exchangeRateRepository.save(rate);

        return ApiResponse.success(
                null,
                "Exchange rate deleted successfully"
        );
    }

    private ExchangeRateResponseDTO toResponse(ExchangeRate rate) {

        return ExchangeRateResponseDTO.builder()
                .id(rate.getId())
                .fromCurrencyId(rate.getFromCurrency().getId())
                .fromCurrencyCode(rate.getFromCurrency().getCurrencyCode())
                .fromCurrencyName(rate.getFromCurrency().getCurrencyName())
                .toCurrencyId(rate.getToCurrency().getId())
                .toCurrencyCode(rate.getToCurrency().getCurrencyCode())
                .toCurrencyName(rate.getToCurrency().getCurrencyName())
                .rate(rate.getRate())
                .effectiveDate(rate.getEffectiveDate())
                .active(rate.getActive())
                .build();
    }

    private PageResponse<ExchangeRateResponseDTO> toPageResponse(
            Page<ExchangeRate> page) {

        return PageResponse.<ExchangeRateResponseDTO>builder()
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