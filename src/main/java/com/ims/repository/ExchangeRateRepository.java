package com.ims.repository;


import com.ims.entity.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.Optional;

public interface ExchangeRateRepository
        extends JpaRepository<ExchangeRate, Long>,
        JpaSpecificationExecutor<ExchangeRate> {

    boolean existsByFromCurrency_IdAndToCurrency_IdAndEffectiveDate(
            Long fromCurrencyId,
            Long toCurrencyId,
            LocalDate effectiveDate
    );

    boolean existsByFromCurrency_IdAndToCurrency_IdAndEffectiveDateAndIdNot(
            Long fromCurrencyId,
            Long toCurrencyId,
            LocalDate effectiveDate,
            Long id
    );

    Optional<ExchangeRate>
    findFirstByFromCurrency_CodeIgnoreCaseAndToCurrency_CodeIgnoreCaseAndActiveTrueAndEffectiveDateLessThanEqualOrderByEffectiveDateDesc(
            String fromCode,
            String toCode,
            LocalDate date
    );
}