package com.ims.service.impl.customer;

import com.ims.dtos.customer.CustomerRequest;
import com.ims.dtos.customer.CustomerResponse;
import com.ims.common.PageResponse;
import com.ims.entity.CustomerEntity;
import com.ims.enums.CustomerStatus;
import com.ims.exception.ResourceNotFoundException;
import com.ims.exception.ValidationException;
import com.ims.mapper.customer.CustomerMapper;
import com.ims.repository.CustomerRepository;
import com.ims.service.serviceInterface.customer.CustomerService;
import com.ims.utils.specification.CustomerSpecification;
import com.ims.utils.validation.CustomerValidation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository repository;

    private final CustomerMapper mapper;

    private final CustomerValidation validation;


    // =====================================================
    // CREATE CUSTOMER
    // =====================================================

    @Override
    public CustomerResponse createCustomer(
            CustomerRequest request) {

        // Validate request
        validation.validateCustomer(request);

        // Validate duplicate email
        validation.validateDuplicateEmail(
                request.getEmail()
        );

        CustomerEntity customer =
                mapper.toEntity(request);

        if (customer.getStatus() == null) {
            customer.setStatus(request.getStatus());
        }

        CustomerEntity savedCustomer =
                repository.save(customer);

        return mapper.toDTO(savedCustomer);
    }


    // =====================================================
    // UPDATE CUSTOMER
    // =====================================================

    @Override
    public CustomerResponse updateCustomer(
            Long id,
            CustomerRequest request) {

        if (request == null) {
            throw new ValidationException(
                    "Customer request is required."
            );
        }

        // Find existing active customer
        CustomerEntity customer =
                validation.validateCustomerId(id);

        // Validate duplicate email
        if (request.getEmail() != null
                && !request.getEmail().isBlank()) {

            validation.validateDuplicateEmail(
                    id,
                    request.getEmail()
            );
        }

        // Update customer
        mapper.updateEntity(
                request,
                customer
        );

        // Update status only when supplied
        if (request.getStatus() != null) {
            customer.setStatus(
                    request.getStatus()
            );
        }

        CustomerEntity updatedCustomer =
                repository.save(customer);

        return mapper.toDTO(updatedCustomer);
    }


    // =====================================================
    // GET CUSTOMER BY ID
    // =====================================================

    @Override
    public CustomerResponse getCustomerById(
            Long id) {

        CustomerEntity customer =
                validation.validateCustomerId(id);

        return mapper.toDTO(customer);
    }


    // =====================================================
    // GET CUSTOMERS
    // =====================================================

    @Override
    public PageResponse<CustomerResponse> getCustomers(
            String search,
            int page,
            int size,
            String sortBy,
            String direction,
            CustomerStatus status
    ) {

        // =====================================================
        // DEFAULT PAGINATION
        // =====================================================

        if (page < 0) {
            page = 0;
        }

        if (size <= 0) {
            size = 10;
        }


        // =====================================================
        // DEFAULT SORT
        // =====================================================

        if (sortBy == null || sortBy.isBlank()) {
            sortBy = "id";
        }

        if (direction == null || direction.isBlank()) {
            direction = "desc";
        }


        Sort sort =
                direction.equalsIgnoreCase("desc")
                        ? Sort.by(sortBy).descending()
                        : Sort.by(sortBy).ascending();

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        sort
                );


        // =====================================================
        // BUILD SPECIFICATION
        // =====================================================

        // Default status = ACTIVE
        CustomerStatus effectiveStatus =
                status == null
                        ? CustomerStatus.ACTIVE
                        : status;

        Specification<CustomerEntity> specification =
                Specification
                        .where(
                                CustomerSpecification.containsKeyword(
                                        search
                                )
                        )
                        .and(
                                CustomerSpecification.hasStatus(
                                        effectiveStatus
                                )
                        );

        // =====================================================
        // FETCH CUSTOMERS
        // =====================================================

        Page<CustomerEntity> customerPage =
                repository.findAll(
                        specification,
                        pageable
                );


        // =====================================================
        // MAP RESPONSE
        // =====================================================

        List<CustomerResponse> content =
                customerPage
                        .stream()
                        .map(mapper::toDTO)
                        .toList();


        // =====================================================
        // PAGE RESPONSE
        // =====================================================

        return PageResponse
                .<CustomerResponse>builder()
                .content(content)
                .pageNumber(customerPage.getNumber())
                .pageSize(customerPage.getSize())
                .totalElements(customerPage.getTotalElements())
                .totalPages(customerPage.getTotalPages())
                .last(customerPage.isLast())
                .build();
    }


    // =====================================================
    // DELETE CUSTOMER
    // =====================================================

    @Override
    public void deleteCustomer(Long id) {

        CustomerEntity customer =
                validation.validateCustomerId(id);

        customer.setStatus(CustomerStatus.INACTIVE);

        repository.save(customer);
    }


    // =====================================================
    // RESTORE CUSTOMER
    // =====================================================

    @Override
    public void restoreCustomer(Long id) {

        if (id == null) {
            throw new ResourceNotFoundException(
                    "Customer is required."
            );
        }

        CustomerEntity customer =
                repository.findById(id)
                        .orElseThrow(
                                () -> new ResourceNotFoundException(
                                        "Customer not found."
                                )
                        );

        customer.setStatus(CustomerStatus.ACTIVE);

        repository.save(customer);
    }


    // =====================================================
    // CUSTOMER DROPDOWN
    // =====================================================

//    @Override
//    public List<CustomerDropdown>
//    getCustomerDropdown() {
//
//        return repository
//                .findByIsDeletedFalseOrderByDisplayNameAsc()
//                .stream()
//                .map(customer ->
//                        CustomerDropdownDTO
//                                .builder()
//                                .id(customer.getId())
//                                .displayName(
//                                        customer.getDisplayName()
//                                )
//                                .build()
//                )
//                .toList();
//    }


    // =====================================================
    // CUSTOMER COUNT
    // =====================================================

//    @Override
//    public Long getCustomerCount() {
//
//        return repository
//                .countByIsDeletedFalse();
//    }


    // =====================================================
    // CUSTOMER DASHBOARD
    // =====================================================

//    @Override
//    public CustomerDashboardDTO getDashboard() {
//
//        long total =
//                repository.countByIsDeletedFalse();
//
//        long business =
//                repository
//                        .countByCustomerTypeAndIsDeletedFalse(
//                                "Business"
//                        );
//
//        long individual =
//                repository
//                        .countByCustomerTypeAndIsDeletedFalse(
//                                "Individual"
//                        );
//
//        return CustomerDashboardDTO
//                .builder()
//                .totalCustomers(total)
//                .businessCustomers(business)
//                .individualCustomers(individual)
//                .activeCustomers(total)
//                .build();
//    }


    // =====================================================
    // CHECK EMAIL EXISTS
    // =====================================================

    @Override
    public Boolean checkEmailExists(
            String email) {

        if (email == null
                || email.trim().isEmpty()) {

            return false;
        }

        return repository
                .existsByEmail(
                        email.trim()
                );
    }
}