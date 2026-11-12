package com.ims.repository;

import com.ims.entity.BankAccount;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public interface BankAccountRepositoryCustom {

    BigDecimal sumBalance(
            Specification<BankAccount> specification,
            boolean opening
    );
}
