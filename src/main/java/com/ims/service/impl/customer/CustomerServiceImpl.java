
package com.ims.service.impl.customer;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.customer.CustomerRequest;
import com.ims.dtos.customer.CustomerResponse;
import com.ims.entity.CustomerEntity;
import com.ims.enums.CustomerStatus;
import com.ims.exception.ResourceNotFoundException;
import com.ims.exception.ValidationException;
import com.ims.mapper.address.AddressMapper;
import com.ims.mapper.customer.CustomerMapper;
import com.ims.repository.CustomerRepository;
import com.ims.service.serviceInterface.customer.CustomerService;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.specification.CustomerSpecification;
import com.ims.utils.validation.CustomerValidation;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository repository;
    private final CustomerMapper mapper;
    private final CustomerValidation validation;
    private final BaseEntityUtil baseEntityUtil;
    private final AddressMapper addressMapper;
    // =====================================================
    // CREATE CUSTOMER
    // =====================================================

    @Override
    public ApiResponse<CustomerResponse> createCustomer(
            CustomerRequest request
    ) {

        validation.validateCustomer(request);

        validation.validateDuplicateEmail(
                request.getEmail()
        );

        CustomerEntity customer = mapper.toEntity(request);

        // Default status = ACTIVE
        if (request.getStatus() == null) {
            customer.setStatus(CustomerStatus.ACTIVE);
        } else {
            if (request.getStatus() == CustomerStatus.DELETED) {
                throw new ValidationException(
                        "Customer cannot be created with DELETED status."
                );
            }

            customer.setStatus(CustomerStatus.ACTIVE);
        }

        // Prepare audit fields
        baseEntityUtil.prepareForCreate(customer);

        CustomerEntity savedCustomer =
                repository.save(customer);

        return ApiResponse.success(
                mapper.toDTO(savedCustomer),
                "Customer created successfully."
        );
    }

    // =====================================================
    // UPDATE CUSTOMER
    // =====================================================

    @Override
    public ApiResponse<CustomerResponse> updateCustomer(
            Long id,
            CustomerRequest request
    ) {

        if (request == null) {
            throw new ValidationException(
                    "Customer request is required."
            );
        }

        // Find existing non-deleted customer
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

        // Preserve existing status before mapper update
        CustomerStatus existingStatus = customer.getStatus();

        // Update customer fields
        // Update customer fields without replacing address entities
        mapper.updateEntity(request, customer);

// Update billing address
        if (request.getBillingAddress() != null) {

            if (customer.getBillingAddress() == null) {

                customer.setBillingAddress(
                        addressMapper.toEntity(
                                request.getBillingAddress()
                        )
                );

            } else {

                addressMapper.updateEntity(
                        request.getBillingAddress(),
                        customer.getBillingAddress()
                );
            }
        }

// Update shipping address
        if (request.getShippingAddress() != null) {

            if (customer.getShippingAddress() == null) {

                customer.setShippingAddress(
                        addressMapper.toEntity(
                                request.getShippingAddress()
                        )
                );

            } else {

                addressMapper.updateEntity(
                        request.getShippingAddress(),
                        customer.getShippingAddress()
                );
            }
        }

        // Update status only when supplied
        if (request.getStatus() != null) {

            if (request.getStatus() == CustomerStatus.DELETED) {
                throw new ValidationException(
                        "Use the delete operation to delete a customer."
                );
            }

            customer.setStatus(request.getStatus());

        } else {
            customer.setStatus(existingStatus);
        }

        // Prepare update audit fields
        baseEntityUtil.prepareForUpdate(customer);

        CustomerEntity updatedCustomer =
                repository.save(customer);

        return ApiResponse.success(
                mapper.toDTO(updatedCustomer),
                "Customer updated successfully."
        );
    }

    // =====================================================
    // GET CUSTOMER BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<CustomerResponse> getCustomerById(
            Long id
    ) {

        CustomerEntity customer =
                validation.validateCustomerId(id);

        return ApiResponse.success(
                mapper.toDTO(customer),
                "Customer fetched successfully."
        );
    }

    // =====================================================
    // GET CUSTOMERS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<CustomerResponse>> getCustomers(
            String search,
            int page,
            int size,
            String sortBy,
            String direction,
            CustomerStatus status
    ) {

        // =================================================
        // DEFAULT PAGINATION
        // =================================================

        if (page < 0) {
            page = 0;
        }

        if (size <= 0) {
            size = 10;
        }

        // =================================================
        // DEFAULT SORT
        // =================================================

        if (sortBy == null || sortBy.isBlank()) {
            sortBy = "id";
        }

        if (direction == null || direction.isBlank()) {
            direction = "desc";
        }

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(
                page,
                size,
                sort
        );

        // =================================================
        // BUILD SPECIFICATION
        // =================================================

        // Default status = ACTIVE
        CustomerStatus effectiveStatus =
                status == null
                        ? CustomerStatus.ALL
                        : status;

        Specification<CustomerEntity> specification =
                Specification
                        .where(CustomerSpecification.isNotDeleted())
                        .and(CustomerSpecification.containsKeyword(search));

        // ALL means ACTIVE + INACTIVE, but never DELETED.
        if (effectiveStatus != CustomerStatus.ALL) {
            specification = specification.and(
                    CustomerSpecification.hasStatus(effectiveStatus)
            );
        }

        // =================================================
        // FETCH CUSTOMERS
        // =================================================

        Page<CustomerEntity> customerPage =
                repository.findAll(
                        specification,
                        pageable
                );

        // =================================================
        // MAP RESPONSE
        // =================================================

        List<CustomerResponse> content =
                customerPage.getContent()
                        .stream()
                        .map(mapper::toDTO)
                        .toList();

        // =================================================
        // PAGE RESPONSE
        // =================================================

        PageResponse<CustomerResponse> pageResponse =
                PageResponse.<CustomerResponse>builder()
                        .content(content)
                        .pageNumber(customerPage.getNumber())
                        .pageSize(customerPage.getSize())
                        .totalElements(customerPage.getTotalElements())
                        .totalPages(customerPage.getTotalPages())
                        .last(customerPage.isLast())
                        .build();

        return ApiResponse.success(
                pageResponse,
                "Customers fetched successfully."
        );
    }

    // =====================================================
    // DELETE CUSTOMER
    // =====================================================

    @Override
    public ApiResponse<Void> deleteCustomer(Long id) {

        CustomerEntity customer =
                validation.validateCustomerId(id);

        // Prevent deletion if customer is already referenced
        // by invoices, sales orders, or other transactions.
        validation.validateCanDelete(id);

        customer.setStatus(CustomerStatus.DELETED);

        // Update audit fields
        baseEntityUtil.prepareForUpdate(customer);

        repository.save(customer);

        return ApiResponse.success(
                null,
                "Customer deleted successfully."
        );
    }

    // =====================================================
    // RESTORE CUSTOMER
    // =====================================================

    @Override
    public ApiResponse<Void> restoreCustomer(Long id) {

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

        if (customer.getStatus() != CustomerStatus.DELETED) {
            throw new ValidationException(
                    "Only deleted customers can be restored."
            );
        }

        customer.setStatus(CustomerStatus.ACTIVE);

        baseEntityUtil.prepareForUpdate(customer);

        repository.save(customer);

        return ApiResponse.success(
                null,
                "Customer restored successfully."
        );
    }

    // =====================================================
    // CHECK EMAIL EXISTS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Boolean> checkEmailExists(
            String email
    ) {

        if (email == null || email.trim().isEmpty()) {
            return ApiResponse.success(
                    false,
                    "Email is required."
            );
        }

        boolean exists = repository.existsByEmail(
                email.trim()
        );

        return ApiResponse.success(
                exists,
                "Email availability checked successfully."
        );
    }
}
