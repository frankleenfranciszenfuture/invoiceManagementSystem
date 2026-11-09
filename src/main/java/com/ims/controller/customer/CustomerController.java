
package com.ims.controller.customer;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.customer.CustomerRequest;
import com.ims.dtos.customer.CustomerResponse;
import com.ims.enums.CustomerStatus;
import com.ims.service.serviceInterface.customer.CustomerService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerService customerService;

    // =====================================================
    // CREATE CUSTOMER
    // =====================================================

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(
            @Valid @RequestBody CustomerRequest request
    ) {

        ApiResponse<CustomerResponse> response =
                customerService.createCustomer(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =====================================================
    // GET ALL CUSTOMERS
    // Pagination + Search + Status + Sorting
    // =====================================================

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CustomerResponse>>> getCustomers(

            @RequestParam(defaultValue = "")
            String search,

            @RequestParam(defaultValue = "ALL")
            CustomerStatus status,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "displayName")
            String sortBy,

            @RequestParam(defaultValue = "asc")
            String direction
    ) {

        ApiResponse<PageResponse<CustomerResponse>> response =
                customerService.getCustomers(
                        search,
                        page,
                        size,
                        sortBy,
                        direction,
                        status
                );

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // CHECK EMAIL EXISTS
    // =====================================================

    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<Boolean>> checkEmail(
            @RequestParam String email
    ) {

        ApiResponse<Boolean> response =
                customerService.checkEmailExists(email);

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // GET CUSTOMER BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(
            @PathVariable Long id
    ) {

        ApiResponse<CustomerResponse> response =
                customerService.getCustomerById(id);

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // UPDATE CUSTOMER
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(

            @PathVariable Long id,

            @Valid
            @RequestBody CustomerRequest request
    ) {

        ApiResponse<CustomerResponse> response =
                customerService.updateCustomer(
                        id,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // SOFT DELETE CUSTOMER
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(
            @PathVariable Long id
    ) {

        ApiResponse<Void> response =
                customerService.deleteCustomer(id);

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // RESTORE CUSTOMER
    // =====================================================

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreCustomer(
            @PathVariable Long id
    ) {

        ApiResponse<Void> response =
                customerService.restoreCustomer(id);

        return ResponseEntity.ok(response);
    }
}
