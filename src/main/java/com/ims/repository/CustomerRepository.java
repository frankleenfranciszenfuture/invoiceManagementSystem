package com.ims.repository;

import com.ims.entity.CustomerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository
        extends JpaRepository<CustomerEntity, Long>,
        JpaSpecificationExecutor<CustomerEntity> {

    // =====================================================
    // FIND CUSTOMER BY ID
    // =====================================================

    Optional<CustomerEntity> findById(Long id);

    // =====================================================
    // FIND CUSTOMER BY EMAIL
    // =====================================================

    Optional<CustomerEntity> findByEmail(String email);

    // =====================================================
    // CHECK DUPLICATE EMAIL
    // =====================================================

    boolean existsByEmail(String email);

    // =====================================================
    // ALL CUSTOMERS
    // =====================================================

    List<CustomerEntity> findAllByOrderByDisplayNameAsc();

    // =====================================================
    // CUSTOMER TYPE COUNT
    // =====================================================

    long countByCustomerType(String customerType);
}