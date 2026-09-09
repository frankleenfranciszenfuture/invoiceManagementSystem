package com.ims.service.serviceInterface.customer;



import com.ims.common.PageResponse;
import com.ims.dtos.customer.CustomerRequest;
import com.ims.dtos.customer.CustomerResponse;
import com.ims.enums.CustomerStatus;

import java.util.List;

public interface CustomerService {

    CustomerResponse createCustomer(CustomerRequest request);

    CustomerResponse updateCustomer(Long id, CustomerRequest request);

    CustomerResponse getCustomerById(Long id);

    PageResponse<CustomerResponse> getCustomers(
            String search,
            int page,
            int size,
            String sortBy,
            String direction,
            CustomerStatus status);

    void deleteCustomer(Long id);

    void restoreCustomer(Long id);

//    List<CustomerDropdown> getCustomerDropdown();

//    Long getCustomerCount();

//    CustomerDashboardDTO getDashboard();

    Boolean checkEmailExists(String email);
}
