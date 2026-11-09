package com.ims.service.serviceInterface.customer;



import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.customer.CustomerRequest;
import com.ims.dtos.customer.CustomerResponse;
import com.ims.enums.CustomerStatus;

import java.util.List;

public interface CustomerService {

    ApiResponse<CustomerResponse> createCustomer(CustomerRequest request);

    ApiResponse<CustomerResponse> updateCustomer(
            Long id,
            CustomerRequest request
    );

    ApiResponse<CustomerResponse> getCustomerById(Long id);

    ApiResponse<PageResponse<CustomerResponse>> getCustomers(
            String search,
            int page,
            int size,
            String sortBy,
            String direction,
            CustomerStatus status
    );

    ApiResponse<Void> deleteCustomer(Long id);

    ApiResponse<Void> restoreCustomer(Long id);

    ApiResponse<Boolean> checkEmailExists(String email);
}
