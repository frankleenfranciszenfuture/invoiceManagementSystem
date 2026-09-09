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

import java.util.List;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerController {


    private final CustomerService customerService;
//
//    private final InvoiceService invoiceService;


    // =====================================================
    // CREATE CUSTOMER
    // =====================================================

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>>
    createCustomer(
            @Valid @RequestBody CustomerRequest request) {

        CustomerResponse response =
                customerService.createCustomer(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                response,
                                "Customer created successfully."

                        )
                );
    }


    // =====================================================
    // GET ALL CUSTOMERS
    // Pagination + Search + Status + Sorting
    // =====================================================

    @GetMapping
    public ResponseEntity<
            ApiResponse<PageResponse<CustomerResponse>>>
    getCustomers(

            @RequestParam(
                    defaultValue = ""
            )
            String search,

            @RequestParam(
                    defaultValue = "ALL"
            )
            CustomerStatus status,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "10"
            )
            int size,

            @RequestParam(
                    defaultValue = "displayName"
            )
            String sortBy,

            @RequestParam(
                    defaultValue = "asc"
            )
            String direction) {


        PageResponse<CustomerResponse> response =
                customerService.getCustomers(
                        search,
                        page,
                        size,
                        sortBy,
                        direction,
                        status
                );


        return ResponseEntity.ok(
                ApiResponse.success(
                        response,
                        "Customers fetched successfully."

                )
        );
    }


    // =====================================================
    // CUSTOMER DROPDOWN
    // =====================================================

//    @GetMapping("/dropdown")
//    public ResponseEntity<
//            ApiResponse<List<CustomerDropdown>>>
//    getDropdown() {
//
//        List<CustomerDropdown> response =
//                customerService.getCustomerDropdown();
//
//        return ResponseEntity.ok(
//                ApiResponse.success(
//                        response,
//                        "Customer dropdown fetched successfully.",
//
//                )
//        );
//    }


    // =====================================================
    // CUSTOMER COUNT
    // =====================================================

//    @GetMapping("/count")
//    public ResponseEntity<ApiResponse<Long>>
//    getCustomerCount() {
//
//        Long count =
//                customerService.getCustomerCount();
//
//        return ResponseEntity.ok(
//                ApiResponse.success(
//                        count,
//                        "Customer count fetched successfully."
//
//                )
//        );
//    }


    // =====================================================
    // CUSTOMER DASHBOARD
    // =====================================================

//    @GetMapping("/dashboard")
//    public ResponseEntity<
//            ApiResponse<CustomerDashboard>>
//    getDashboard() {
//
//        CustomerDashboardDTO response =
//                customerService.getDashboard();
//
//        return ResponseEntity.ok(
//                ApiResponse.success(
//                        "Dashboard fetched successfully.",
//                        response
//                )
//        );
//    }


    // =====================================================
    // CHECK EMAIL EXISTS
    // =====================================================

    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<Boolean>>
    checkEmail(
            @RequestParam String email) {

        Boolean exists =
                customerService.checkEmailExists(email);

        return ResponseEntity.ok(
                ApiResponse.success(
                        exists,
                        "Email checked successfully."

                )
        );
    }


    // =====================================================
    // GET CUSTOMER BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<
            ApiResponse<CustomerResponse>>
    getCustomerById(
            @PathVariable Long id) {

        CustomerResponse response =
                customerService.getCustomerById(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        response,
                        "Customer fetched successfully."

                )
        );
    }


    // =====================================================
    // GET CUSTOMER INVOICES
    // =====================================================

//    @GetMapping("/{customerId}/invoices")
//    public ResponseEntity<
//            ApiResponse<PageResponse<InvoiceResponse>>>
//    getCustomerInvoices(
//
//            @PathVariable Long customerId,
//
//            @RequestParam(
//                    defaultValue = ""
//            )
//            String search,
//
//            @RequestParam(
//                    defaultValue = "0"
//            )
//            int page,
//
//            @RequestParam(
//                    defaultValue = "100"
//            )
//            int size,
//
//            @RequestParam(
//                    defaultValue = "invoiceDate"
//            )
//            String sortBy,
//
//            @RequestParam(
//                    defaultValue = "desc"
//            )
//            String direction) {
//
//
//        PageResponse<InvoiceResponse> response =
//                invoiceService.getCustomerInvoices(
//                        customerId,
//                        search,
//                        page,
//                        size,
//                        sortBy,
//                        direction
//                );
//
//
//        return ResponseEntity.ok(
//                ApiResponse.success(
//                        "Customer invoices fetched successfully.",
//                        response
//                )
//        );
//    }


    // =====================================================
    // UPDATE CUSTOMER
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<
            ApiResponse<CustomerResponse>>
    updateCustomer(

            @PathVariable Long id,

            @Valid
            @RequestBody CustomerRequest request) {


        CustomerResponse response =
                customerService.updateCustomer(
                        id,
                        request
                );


        return ResponseEntity.ok(
                ApiResponse.success(
                        response,
                        "Customer updated successfully."

                )
        );
    }


    // =====================================================
    // SOFT DELETE CUSTOMER
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>>
    deleteCustomer(
            @PathVariable Long id) {

        customerService.deleteCustomer(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        null,
                        "Customer deleted successfully."

                )
        );
    }


    // =====================================================
    // RESTORE CUSTOMER
    // =====================================================

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>>
    restoreCustomer(
            @PathVariable Long id) {

        customerService.restoreCustomer(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        null,
                        "Customer restored successfully."

                )
        );
    }
}

