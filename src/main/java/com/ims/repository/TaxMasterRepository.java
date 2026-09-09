package com.ims.repository;

import com.ims.entity.TaxMasterEntity;
import com.ims.enums.Status;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface TaxMasterRepository extends
        JpaRepository<TaxMasterEntity, Long>,
        JpaSpecificationExecutor<TaxMasterEntity> {

    Optional<TaxMasterEntity> findByIdAndStatus(
            Long id,
            Status status
    );

    boolean existsByTaxNameIgnoreCaseAndActiveTrue(String taxName);

    Optional<TaxMasterEntity> findByTaxNameIgnoreCaseAndActiveTrue(
            String taxName
    );

    Optional<TaxMasterEntity> findByIdAndActiveTrue(
            Long id
    );
}