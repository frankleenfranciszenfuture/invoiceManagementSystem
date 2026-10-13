package com.ims.repository;


import com.ims.entity.Currency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface CurrencyRepository
        extends JpaRepository<Currency, Long>,
        JpaSpecificationExecutor<Currency> {

    Optional<Currency> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(
            String code,
            Long id
    );
}
