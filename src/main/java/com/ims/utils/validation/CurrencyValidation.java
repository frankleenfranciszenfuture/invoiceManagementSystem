package com.ims.utils.validation;

import com.ims.entity.Currency;
import com.ims.repository.CurrencyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
@RequiredArgsConstructor
public class CurrencyValidation {

    private final CurrencyRepository currencyRepository;

    public Currency validateExists(Long id) {
        if (id == null) {
            throw new IllegalArgumentException(
                    "Currency ID is required"
            );
        }

        return currencyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Currency not found: " + id
                ));
    }

    public String normalizeCode(String code) {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException(
                    "Currency code is required"
            );
        }

        String normalized = code.trim().toUpperCase(Locale.ROOT);

        if (!normalized.matches("[A-Z]{3}")) {
            throw new IllegalArgumentException(
                    "Currency code must contain exactly 3 letters"
            );
        }

        return normalized;
    }

    public void validateUniqueCode(
            String currencyCode,
            Long currentId) {

        boolean exists = currentId == null
                ? currencyRepository.existsByCurrencyCodeIgnoreCase(currencyCode)
                : currencyRepository
                .existsByCurrencyCodeIgnoreCaseAndIdNot(currencyCode, currentId);

        if (exists) {
            throw new IllegalArgumentException(
                    "Currency code already exists: " + currencyCode
            );
        }
    }
}
