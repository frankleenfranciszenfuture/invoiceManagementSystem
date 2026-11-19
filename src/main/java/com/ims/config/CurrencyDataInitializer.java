
package com.ims.config;

import com.ims.entity.Currency;
import com.ims.enums.CurrencyStatus;
import com.ims.repository.CurrencyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class CurrencyDataInitializer implements CommandLineRunner {

    private final CurrencyRepository currencyRepository;

    private static final String DEFAULT_CURRENCY_CODE = "INR";

    @Override
    @Transactional
    public void run(String... args) {
        initializeDefaultCurrency();
    }

    private void initializeDefaultCurrency() {

        Currency currency = currencyRepository
                .findByCurrencyCodeIgnoreCase(DEFAULT_CURRENCY_CODE)
                .orElse(null);

        if (currency == null) {

            currency = Currency.builder()
                    .currencyCode(DEFAULT_CURRENCY_CODE)
                    .currencyName("Indian Rupee")
                    .symbol("₹")
                    .decimalPlaces(2)
                    .status(CurrencyStatus.ACTIVE)
                    .active(true)
                    .build();

            currencyRepository.save(currency);

            log.info("Default currency {} created successfully.",
                    DEFAULT_CURRENCY_CODE);

            return;
        }

        boolean updated = false;

        if (!Boolean.TRUE.equals(currency.getActive())) {
            currency.setActive(true);
            updated = true;
        }

        if (currency.getStatus() != CurrencyStatus.ACTIVE) {
            currency.setStatus(CurrencyStatus.ACTIVE);
            updated = true;
        }

        if (updated) {
            currencyRepository.save(currency);

            log.info("Default currency {} activated successfully. ID: {}",
                    DEFAULT_CURRENCY_CODE, currency.getId());
        } else {
            log.info("Default currency {} already configured. ID: {}",
                    DEFAULT_CURRENCY_CODE, currency.getId());
        }
    }
}
