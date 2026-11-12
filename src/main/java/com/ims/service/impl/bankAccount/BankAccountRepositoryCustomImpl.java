package com.ims.service.impl.bankAccount;


import com.ims.entity.BankAccount;

import com.ims.repository.BankAccountRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public class BankAccountRepositoryCustomImpl
        implements BankAccountRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public BigDecimal sumBalance(
            Specification<BankAccount> specification,
            boolean opening
    ) {

        CriteriaBuilder cb =
                entityManager.getCriteriaBuilder();

        CriteriaQuery<BigDecimal> query =
                cb.createQuery(BigDecimal.class);

        Root<BankAccount> root =
                query.from(BankAccount.class);

        Expression<BigDecimal> balance =
                root.get(
                        opening
                                ? "openingBalance"
                                : "currentBalance"
                );

        query.select(cb.coalesce(
                cb.sum(balance),
                BigDecimal.ZERO
        ));

        if (specification != null) {

            Predicate predicate =
                    specification.toPredicate(root, query, cb);

            if (predicate != null) {
                query.where(predicate);
            }
        }

        TypedQuery<BigDecimal> typedQuery =
                entityManager.createQuery(query);

        BigDecimal result = typedQuery.getSingleResult();

        return result == null
                ? BigDecimal.ZERO
                : result;
    }
}
