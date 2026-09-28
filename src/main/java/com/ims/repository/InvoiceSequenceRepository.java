package com.ims.repository;


import com.ims.entity.InvoiceSequenceEntity;
import com.ims.enums.InvoiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceSequenceRepository
        extends JpaRepository<InvoiceSequenceEntity, Long> {

    // =====================================================
    // FIND ALL
    // =====================================================

    @Override
    List<InvoiceSequenceEntity> findAll();


    // =====================================================
    // FIND BY ID
    // =====================================================

    @Override
    Optional<InvoiceSequenceEntity> findById(Long id);


    // =====================================================
    // FIND BY BRANCH + INVOICE TYPE
    // =====================================================

    Optional<InvoiceSequenceEntity> findByInvoiceType(
            InvoiceType invoiceType
    );

}
