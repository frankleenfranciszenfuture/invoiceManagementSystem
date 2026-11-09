package com.ims.repository;


import com.ims.entity.Currency;
import com.ims.enums.CurrencyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface CurrencyRepository
        extends JpaRepository<Currency, Long>,
        JpaSpecificationExecutor<Currency> {


    Optional<Currency> findByIdAndActiveTrue(Long id);

    Optional<Currency> findByCurrencyCodeIgnoreCase(String currencyCode);

    boolean existsByCurrencyCodeIgnoreCase(String currencyCode);

    boolean existsByCurrencyCodeIgnoreCaseAndIdNot(
            String currencyCode,
            Long id
    );
    Optional<Currency> findByCurrencyCodeIgnoreCaseAndActiveTrue(
            String currencyCode
    );

    Optional<Currency> findByCurrencyCodeIgnoreCaseAndActiveFalse(
            String currencyCode
    );

    boolean existsByCurrencyCodeIgnoreCaseAndActiveTrue(
            String currencyCode
    );

    Optional<Currency> findByCurrencyCodeIgnoreCaseAndStatus(
            String currencyCode,
            CurrencyStatus status
    );

}

