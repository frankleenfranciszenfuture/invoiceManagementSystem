package com.ims.utils.validation;

import com.ims.entity.Currency;
import com.ims.entity.ExchangeRate;
import com.ims.repository.CurrencyRepository;
import com.ims.repository.ExchangeRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class ExchangeRateValidation {

    private final ExchangeRateRepository exchangeRateRepository;
    private final CurrencyValidation currencyValidation;
    private final CurrencyRepository currencyRepository;


    public ExchangeRate validateExists(Long id) {
        if (id == null) {
            throw new IllegalArgumentException(
                    "Exchange rate ID is required"
            );
        }

        return exchangeRateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Exchange rate not found: " + id
                ));
    }

    public Currency validateCurrency(String code) {
        String normalized = code.trim()
                .toUpperCase(Locale.ROOT);

        Currency currency = currencyValidation.validateExists(
                // Resolve by code in the helper below.
                currencyValidationId(normalized)
        );

        if (!Boolean.TRUE.equals(currency.getActive())) {
            throw new IllegalArgumentException(
                    "Currency is inactive: " + normalized
            );
        }

        return currency;
    }

    private Long currencyValidationId(String code) {
        return currencyValidationIdLookup(code);
    }

    private Long currencyValidationIdLookup(String code) {
        // This method is replaced by the direct repository lookup
        // in the complete version of CurrencyValidation below.
        throw new UnsupportedOperationException(
                "Use CurrencyValidation.validateActiveByCode instead"
        );
    }

    public void validateRate(BigDecimal rate) {
        if (rate == null || rate.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Exchange rate must be greater than zero"
            );
        }

        if (rate.scale() > 6) {
            throw new IllegalArgumentException(
                    "Exchange rate supports up to 6 decimal places"
            );
        }

        if (rate.precision() - rate.scale() > 12) {
            throw new IllegalArgumentException(
                    "Exchange rate exceeds the supported precision"
            );
        }
    }

    public void validateCurrencyPair(
            Currency from,
            Currency to) {

        if (from.getId().equals(to.getId())) {
            throw new IllegalArgumentException(
                    "Source and target currencies must be different"
            );
        }
    }

    public void validateUniqueRate(
            Long fromId,
            Long toId,
            LocalDate date,
            Long currentId) {

        boolean exists = currentId == null
                ? exchangeRateRepository
                .existsByFromCurrency_IdAndToCurrency_IdAndEffectiveDate(
                        fromId, toId, date
                )
                : exchangeRateRepository
                .existsByFromCurrency_IdAndToCurrency_IdAndEffectiveDateAndIdNot(
                        fromId, toId, date, currentId
                );

        if (exists) {
            throw new IllegalArgumentException(
                    "An exchange rate already exists for this currency pair and date"
            );
        }
    }

    public Currency validateActiveByCode(String code) {
        String normalized = normalizeCode(code);

        Currency currency = currencyRepository
                .findByCurrencyCodeIgnoreCase(normalized)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Currency not found: " + normalized
                ));

        if (!Boolean.TRUE.equals(currency.getActive())) {
            throw new IllegalArgumentException(
                    "Currency is inactive: " + normalized
            );
        }

        return currency;
    }

    private String normalizeCode(
            String value) {

        if (value == null ||
                value.isBlank()) {

            return null;
        }

        return value.trim();
    }
}