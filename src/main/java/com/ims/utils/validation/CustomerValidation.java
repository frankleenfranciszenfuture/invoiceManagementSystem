package com.ims.utils.validation;


import com.ims.dtos.customer.CustomerRequest;
import com.ims.entity.CustomerEntity;
import com.ims.exception.DuplicateResourceException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.exception.ValidationException;
import com.ims.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CustomerValidation {

    private final CustomerRepository customerRepository;


    // =====================================================
    // VALIDATE CUSTOMER REQUEST
    // =====================================================

    public void validateCustomer(CustomerRequest request) {

        if (request == null) {
            throw new ValidationException(
                    "Customer request is required."
            );
        }

        // -------------------------------------------------
        // CUSTOMER TYPE
        // -------------------------------------------------

        if (isBlank(request.getCustomerType())) {
            throw new ValidationException(
                    "Customer type is required."
            );
        }

        if (!request.getCustomerType().equalsIgnoreCase("Business")
                && !request.getCustomerType().equalsIgnoreCase("Individual")) {

            throw new ValidationException(
                    "Customer type must be Business or Individual."
            );
        }


        // -------------------------------------------------
        // CUSTOMER NAME
        // -------------------------------------------------

        if (isBlank(request.getDisplayName())) {
            throw new ValidationException(
                    "Customer name is required."
            );
        }


        // -------------------------------------------------
        // EMAIL
        // -------------------------------------------------

        if (isBlank(request.getEmail())) {
            throw new ValidationException(
                    "Email is required."
            );
        }

        validateEmail(request.getEmail());


        // -------------------------------------------------
        // CUSTOMER LANGUAGE
        // -------------------------------------------------

        if (isBlank(request.getCustomerLanguage())) {
            throw new ValidationException(
                    "Customer language is required."
            );
        }


        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        if (request.getStatus() == null) {
            throw new ValidationException(
                    "Customer status is required."
            );
        }


        // -------------------------------------------------
        // PHONE VALIDATION
        // -------------------------------------------------

        if (!isBlank(request.getMobile())) {
            validatePhone(
                    request.getMobile(),
                    "Mobile number"
            );
        }

        if (!isBlank(request.getWorkPhone())) {
            validatePhone(
                    request.getWorkPhone(),
                    "Work phone"
            );
        }
    }


    // =====================================================
    // DUPLICATE EMAIL - CREATE
    // =====================================================

    public void validateDuplicateEmail(String email) {

        if (isBlank(email)) {
            return;
        }

        if (customerRepository
                .existsByEmail(email.trim())) {

            throw new DuplicateResourceException(
                    "Email already exists."
            );
        }
    }


    // =====================================================
    // DUPLICATE EMAIL - UPDATE
    // =====================================================

    public void validateDuplicateEmail(
            Long id,
            String email) {

        if (isBlank(email)) {
            return;
        }

        customerRepository
                .findByEmail(email.trim())
                .ifPresent(customer -> {

                    if (!customer.getId().equals(id)) {

                        throw new DuplicateResourceException(
                                "Email already exists."
                        );
                    }
                });
    }


    // =====================================================
    // VALIDATE CUSTOMER ID
    // =====================================================

    public CustomerEntity validateCustomerId(Long id) {

        if (id == null) {
            throw new ResourceNotFoundException(
                    "Customer is required."
            );
        }

        return customerRepository
                .findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Customer not found."
                        )
                );
    }


    // =====================================================
    // VALIDATE EMAIL
    // =====================================================

    private void validateEmail(String email) {

        String emailRegex =
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";

        if (!email.trim().matches(emailRegex)) {

            throw new ValidationException(
                    "Invalid email format."
            );
        }
    }


    // =====================================================
    // VALIDATE PHONE
    // =====================================================

    private void validatePhone(
            String phone,
            String fieldName) {

        String cleanedPhone = phone
                .replaceAll("[\\s()-]", "");

        if (!cleanedPhone.matches("\\+?[0-9]{7,15}")) {

            throw new ValidationException(
                    fieldName + " must contain 7 to 15 digits."
            );
        }
    }


    // =====================================================
    // STRING VALIDATION
    // =====================================================

    private boolean isBlank(String value) {

        return value == null
                || value.trim().isEmpty();
    }
}