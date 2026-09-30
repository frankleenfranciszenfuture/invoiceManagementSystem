package com.ims.service.serviceInterface.bankAccount;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.bankAccount.BankAccountCreateRequest;
import com.ims.dtos.bankAccount.BankAccountResponse;
import com.ims.dtos.bankAccount.BankAccountSearchRequest;
import com.ims.dtos.bankAccount.BankAccountUpdateRequest;
import org.springframework.data.domain.Pageable;

public interface BankAccountService {

    ApiResponse<BankAccountResponse> createBankAccount(
            BankAccountCreateRequest request
    );

    ApiResponse<BankAccountResponse> getBankAccountById(
            Long id
    );

    ApiResponse<PageResponse<BankAccountResponse>> getAllBankAccounts(
            BankAccountSearchRequest request,
            Pageable pageable
    );

    ApiResponse<BankAccountResponse> updateBankAccount(
            Long id,
            BankAccountUpdateRequest request
    );

    ApiResponse<Void> deleteBankAccount(
            Long id
    );
}
