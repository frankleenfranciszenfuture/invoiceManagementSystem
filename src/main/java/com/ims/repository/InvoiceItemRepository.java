package com.ims.repository;

import com.ims.entity.InvoiceItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceItemRepository
        extends JpaRepository<InvoiceItemEntity, Long> {

    boolean existsByProductId(Long productId);
}